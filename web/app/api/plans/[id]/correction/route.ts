import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canReviewPlan, isActionable } from "@/lib/plans";
import { audit } from "@/lib/insights";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const plan = await prisma.shipmentPlan.findUnique({
    where: { id: (await params).id },
    include: { shipment: { select: { customerId: true } } },
  });
  if (!plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canReviewPlan(user, { customerId: plan.shipment.customerId })) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const latest = await prisma.shipmentPlan.findFirst({
    where: { shipmentId: plan.shipmentId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  if (!isActionable(plan, latest?.version ?? plan.version)) {
    return NextResponse.json(
      { error: "Only the latest pending version can be sent back" },
      { status: 409 },
    );
  }
  const parsed = z
    .object({ message: z.string().max(1000).default("") })
    .safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const updated = await prisma.shipmentPlan.update({
    where: { id: plan.id },
    data: { status: "correction_requested", correctionNote: parsed.data.message },
    select: { id: true, version: true, status: true },
  });
  await audit(user.id, "plan.correction", "ShipmentPlan", plan.id, parsed.data.message.slice(0, 200));
  return NextResponse.json(updated);
}
