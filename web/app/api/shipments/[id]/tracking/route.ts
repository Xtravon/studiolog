import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { allowedNext, canAdvance, canTrack, defaultMessage } from "@/lib/tracking";

interface Ctx {
  params: Promise<{ id: string }>;
}

const postSchema = z.object({
  milestone: z.string().min(1),
  message: z.string().max(500).default(""),
  actionRequired: z.boolean().default(false),
});

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
    select: { id: true, customerId: true, status: true },
  });
  if (!shipment || (user.group !== "admin" && shipment.customerId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const events = await prisma.trackingEvent.findMany({
    where: { shipmentId: shipment.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ status: shipment.status, events });
}

export async function POST(request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user || !canTrack(user)) {
    return NextResponse.json({ error: "Operations staff only" }, { status: 403 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
  });
  if (!shipment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = postSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }
  const { milestone } = parsed.data;
  if (!canAdvance(shipment.status, milestone)) {
    return NextResponse.json(
      {
        error: `Cannot move from ${shipment.status} to ${milestone}`,
        allowed: allowedNext(shipment.status),
      },
      { status: 409 },
    );
  }
  const message = parsed.data.message || defaultMessage(milestone);
  const [event] = await prisma.$transaction([
    prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        milestone,
        message,
        actionRequired: parsed.data.actionRequired,
        createdBy: user.id,
      },
    }),
    prisma.shipment.update({
      where: { id: shipment.id },
      data: { status: milestone as never },
    }),
  ]);
  return NextResponse.json({ event }, { status: 201 });
}
