import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { checkPayable } from "@/lib/payments";
import { audit, trackEvent } from "@/lib/insights";

const paySchema = z.object({
  planId: z.string().min(1),
  simulate: z.enum(["success", "fail"]).default("success"),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = paySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment request" }, { status: 400 });
  }
  const plan = await prisma.shipmentPlan.findUnique({
    where: { id: parsed.data.planId },
    include: { shipment: { select: { id: true, status: true, customerId: true } } },
  });
  if (!plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const latest = await prisma.shipmentPlan.findFirst({
    where: { shipmentId: plan.shipmentId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const check = checkPayable(user, {
    id: plan.id,
    shipmentId: plan.shipmentId,
    version: plan.version,
    status: plan.status,
    totalPrice: plan.totalPrice,
    currency: plan.currency,
    shipmentStatus: plan.shipment.status,
    shipmentCustomerId: plan.shipment.customerId,
    latestVersion: latest?.version ?? plan.version,
  });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.code });
  }

  // Idempotent retry: one payment row per approved plan version.
  // Success returns immediately; a failed attempt can be retried on the same row.
  let payment = await prisma.payment.findUnique({
    where: { providerRef: check.providerRef },
  });
  if (payment?.status === "success") {
    return NextResponse.json({ payment });
  }
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        shipmentId: plan.shipmentId,
        planId: plan.id,
        amount: check.amount,
        currency: check.currency,
        provider: "test",
        providerRef: check.providerRef,
        status: "pending",
      },
    });
  }

  // Test provider: settles immediately. Swap for a real provider webhook later.
  if (parsed.data.simulate === "success") {
    const [settled] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "success" },
      }),
      prisma.shipment.update({
        where: { id: plan.shipmentId },
        data: { status: "confirmed" },
      }),
    ]);
    await trackEvent("payment.succeeded", { shipmentId: plan.shipmentId, userId: user.id });
    await audit(user.id, "payment.success", "Payment", payment.id, `${settled.currency} ${settled.amount}`);
    return NextResponse.json({ payment: settled, booking: "confirmed" });
  }
  const failed = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "failed" },
  });
  return NextResponse.json(
    { payment: failed, error: "Test payment declined. No charge was made — retry or contact support." },
    { status: 402 },
  );
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const shipmentId = new URL(request.url).searchParams.get("shipmentId");
  if (!shipmentId) {
    return NextResponse.json({ error: "shipmentId required" }, { status: 400 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    select: { customerId: true },
  });
  if (!shipment || (user.group !== "admin" && shipment.customerId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const payments = await prisma.payment.findMany({
    where: { shipmentId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ payments });
}
