import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { bookSchema } from "@/lib/consultations";
import { trackEvent } from "@/lib/insights";

const select = {
  id: true,
  mode: true,
  scheduledAt: true,
  meetingLink: true,
  note: true,
  status: true,
  callbackRequested: true,
  updatedAt: true,
  shipment: { select: { id: true, goodsDesc: true, service: { select: { name: true } } } },
} as const;

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const where =
    user.group === "admin"
      ? {}
      : { customerId: user.id };
  const consultations = await prisma.consultation.findMany({
    where,
    orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
    select,
  });
  return NextResponse.json({ consultations });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.group !== "customer") {
    return NextResponse.json({ error: "Sign in as a customer" }, { status: 401 });
  }
  const parsed = bookSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: parsed.data.shipmentId },
  });
  if (!shipment || shipment.customerId !== user.id) {
    return NextResponse.json({ error: "Unknown shipment" }, { status: 400 });
  }
  if (shipment.status !== "draft") {
    return NextResponse.json(
      { error: "Consultations can only be booked on draft shipments" },
      { status: 400 },
    );
  }
  const consultation = await prisma.consultation.create({
    data: {
      shipmentId: shipment.id,
      customerId: user.id,
      mode: parsed.data.mode,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      note: parsed.data.note,
      callbackRequested: parsed.data.callbackRequested,
    },
    select: { id: true },
  });
  await trackEvent("consultation.booked", { shipmentId: shipment.id, userId: user.id });
  return NextResponse.json({ id: consultation.id }, { status: 201 });
}
