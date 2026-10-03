import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { draftSchema } from "@/lib/shipments";

const shipmentSelect = {
  id: true,
  status: true,
  goodsDesc: true,
  pickupAddr: true,
  deliveryAddr: true,
  updatedAt: true,
  service: { select: { id: true, name: true } },
  company: { select: { id: true, name: true, isPrimary: true } },
} as const;

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.group !== "customer") {
    return NextResponse.json({ error: "Sign in as a customer" }, { status: 401 });
  }
  const shipments = await prisma.shipment.findMany({
    where: { customerId: user.id },
    orderBy: { updatedAt: "desc" },
    select: shipmentSelect,
  });
  return NextResponse.json({ shipments });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.group !== "customer") {
    return NextResponse.json({ error: "Sign in as a customer" }, { status: 401 });
  }
  const parsed = draftSchema.safeParse(await request.json().catch(() => ({})));
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
  const shipment = await prisma.shipment.create({
    data: {
      customerId: user.id,
      serviceId: data.serviceId ?? null,
      companyId: data.companyId ?? null,
      goodsDesc: data.goodsDesc,
      quantity: data.quantity,
      weightKg: data.weightKg ?? null,
      dimensions: data.dimensions,
      photos: data.photos,
      handlingNotes: data.handlingNotes,
      pickupAddr: data.pickupAddr,
      deliveryAddr: data.deliveryAddr,
      pickupTimePref: data.pickupTimePref,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: shipment.id }, { status: 201 });
}
