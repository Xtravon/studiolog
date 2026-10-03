import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canReviewPlan, isActionable } from "@/lib/plans";
import { audit, trackEvent } from "@/lib/insights";

interface Ctx {
  params: Promise<{ id: string }>;
}

async function loadActionable(id: string) {
  const plan = await prisma.shipmentPlan.findUnique({
    where: { id },
    include: { shipment: { select: { id: true, customerId: true } } },
  });
  if (!plan) return null;
  const latest = await prisma.shipmentPlan.findFirst({
    where: { shipmentId: plan.shipmentId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  return { plan, latestVersion: latest?.version ?? plan.version };
}

export async function POST(request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const loaded = await loadActionable((await params).id);
  if (!loaded) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { plan, latestVersion } = loaded;
  if (!canReviewPlan(user, { customerId: plan.shipment.customerId })) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  if (!isActionable(plan, latestVersion)) {
    return NextResponse.json(
      { error: "Only the latest pending version can be approved" },
      { status: 409 },
    );
  }
  const updated = await prisma.shipmentPlan.update({
    where: { id: plan.id },
    data: { status: "approved" },
    select: { id: true, version: true, status: true },
  });
  await trackEvent("plan.approved", { shipmentId: plan.shipmentId, userId: user.id });
  await audit(user.id, "plan.approve", "ShipmentPlan", plan.id, `v${plan.version}`);
  return NextResponse.json(updated);
}
