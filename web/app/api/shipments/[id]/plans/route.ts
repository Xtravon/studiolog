import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canBuildPlan, nextVersion } from "@/lib/plans";
import { computeCharge, haversineKm } from "@/lib/pricing";
import { audit } from "@/lib/insights";

interface Ctx {
  params: Promise<{ id: string }>;
}

const buildSchema = z.object({
  serviceId: z.string().min(1).nullable().optional(),
  companyId: z.string().min(1).nullable().optional(),
  distanceKm: z.number().positive().max(20000).nullable().optional(),
  transportCharge: z.number().nonnegative().max(1_000_000_000).nullable().optional(),
  handlingFee: z.number().nonnegative().max(1_000_000_000).default(0),
  timingEstimate: z.string().max(500).default(""),
  conditions: z.string().max(2000).default(""),
});

const planSelect = {
  id: true,
  version: true,
  status: true,
  serviceName: true,
  companyName: true,
  goodsDesc: true,
  quantity: true,
  weightKg: true,
  dimensions: true,
  photos: true,
  handlingNotes: true,
  pickupAddr: true,
  deliveryAddr: true,
  pickupTimePref: true,
  handlerStatement: true,
  distanceKm: true,
  transportCharge: true,
  handlingFee: true,
  totalPrice: true,
  currency: true,
  timingEstimate: true,
  conditions: true,
  correctionNote: true,
  createdAt: true,
} as const;

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
    select: { id: true, customerId: true },
  });
  if (!shipment || (user.group !== "admin" && shipment.customerId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const plans = await prisma.shipmentPlan.findMany({
    where: { shipmentId: shipment.id },
    orderBy: { version: "desc" },
    select: planSelect,
  });
  return NextResponse.json({ plans });
}

export async function POST(request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user || !canBuildPlan(user)) {
    return NextResponse.json({ error: "Sales staff only" }, { status: 403 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
    include: { service: true, company: true, plans: { select: { version: true, status: true } } },
  });
  if (!shipment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (shipment.status !== "draft") {
    return NextResponse.json({ error: "Plans can only be built for draft shipments" }, { status: 400 });
  }
  const parsed = buildSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const b = parsed.data;

  const service = b.serviceId
    ? await prisma.service.findFirst({ where: { id: b.serviceId, active: true } })
    : shipment.service;
  const company = b.companyId
    ? await prisma.company.findFirst({ where: { id: b.companyId, active: true } })
    : shipment.company;
  if (b.serviceId && !service) {
    return NextResponse.json({ error: "Unknown service" }, { status: 400 });
  }
  if (b.companyId && !company) {
    return NextResponse.json({ error: "Unknown company" }, { status: 400 });
  }

  let distanceKm = b.distanceKm ?? shipment.distanceKm ?? 0;
  if (b.distanceKm == null && shipment.distanceKm == null) {
    if (
      shipment.pickupLat != null && shipment.pickupLng != null &&
      shipment.deliveryLat != null && shipment.deliveryLng != null
    ) {
      distanceKm = haversineKm(
        { lat: shipment.pickupLat, lng: shipment.pickupLng },
        { lat: shipment.deliveryLat, lng: shipment.deliveryLng },
      );
    }
  }
  const pricing = await prisma.pricingConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!pricing) {
    return NextResponse.json({ error: "Pricing not configured" }, { status: 400 });
  }
  const transportCharge = b.transportCharge ?? computeCharge(distanceKm, pricing).charge;
  const version = nextVersion(shipment.plans.map((p) => p.version));

  await prisma.$transaction(async (tx) => {
    const latest = [...shipment.plans].sort((a, c) => c.version - a.version)[0];
    if (latest && latest.status === "pending") {
      await tx.shipmentPlan.update({
        where: { shipmentId_version: { shipmentId: shipment.id, version: latest.version } },
        data: { status: "superseded" },
      });
    }
    await tx.shipmentPlan.create({
      data: {
        shipmentId: shipment.id,
        version,
        serviceId: service?.id ?? null,
        companyId: company?.id ?? null,
        serviceName: service?.name ?? "",
        companyName: company?.name ?? "",
        goodsDesc: shipment.goodsDesc,
        quantity: shipment.quantity,
        weightKg: shipment.weightKg,
        dimensions: shipment.dimensions,
        photos: (shipment.photos as object) ?? [],
        handlingNotes: shipment.handlingNotes,
        pickupAddr: shipment.pickupAddr,
        deliveryAddr: shipment.deliveryAddr,
        pickupTimePref: shipment.pickupTimePref,
        distanceKm,
        transportCharge,
        handlingFee: b.handlingFee,
        totalPrice: Math.round((transportCharge + b.handlingFee) * 100) / 100,
        currency: pricing.currency,
        timingEstimate: b.timingEstimate,
        conditions: b.conditions,
        createdBy: user.id,
      },
    });
  });

  // Customer check helper exported for review routes.
  await audit(user.id, "plan.create", "Shipment", shipment.id, `v${version}`);
  return NextResponse.json({ version }, { status: 201 });
}
