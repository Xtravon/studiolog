import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import {
  canEditShipment,
  canViewShipment,
  draftPatchSchema,
} from "@/lib/shipments";

interface Ctx {
  params: Promise<{ id: string }>;
}

const detailSelect = {
  id: true,
  status: true,
  customerId: true,
  serviceId: true,
  companyId: true,
  goodsDesc: true,
  quantity: true,
  weightKg: true,
  dimensions: true,
  photos: true,
  handlingNotes: true,
  pickupAddr: true,
  deliveryAddr: true,
  pickupTimePref: true,
  updatedAt: true,
  service: { select: { id: true, name: true } },
  company: { select: { id: true, name: true, isPrimary: true } },
} as const;

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
    select: detailSelect,
  });
  if (!shipment || !canViewShipment({ ...user, customerId: shipment.customerId })) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ shipment });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
  });
  if (
    !shipment ||
    !canEditShipment({ ...user, status: shipment.status, customerId: shipment.customerId })
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = draftPatchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid shipment details", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;
  if (data.serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, active: true },
    });
    if (!service) {
      return NextResponse.json({ error: "Unknown service" }, { status: 400 });
    }
  }
  if (data.companyId) {
    const company = await prisma.company.findFirst({
      where: { id: data.companyId, active: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Unknown company" }, { status: 400 });
    }
  }
  const updated = await prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      ...(data.serviceId !== undefined ? { serviceId: data.serviceId } : {}),
      ...(data.companyId !== undefined ? { companyId: data.companyId } : {}),
      ...(data.goodsDesc !== undefined ? { goodsDesc: data.goodsDesc } : {}),
      ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      ...(data.weightKg !== undefined ? { weightKg: data.weightKg } : {}),
      ...(data.dimensions !== undefined ? { dimensions: data.dimensions } : {}),
      ...(data.photos !== undefined ? { photos: data.photos } : {}),
      ...(data.handlingNotes !== undefined ? { handlingNotes: data.handlingNotes } : {}),
      ...(data.pickupAddr !== undefined ? { pickupAddr: data.pickupAddr } : {}),
      ...(data.deliveryAddr !== undefined ? { deliveryAddr: data.deliveryAddr } : {}),
      ...(data.pickupTimePref !== undefined ? { pickupTimePref: data.pickupTimePref } : {}),
    },
    select: { id: true, updatedAt: true },
  });
  return NextResponse.json(updated);
}
