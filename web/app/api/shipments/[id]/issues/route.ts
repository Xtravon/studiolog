import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

interface Ctx {
  params: Promise<{ id: string }>;
}

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
  const issues = await prisma.issue.findMany({
    where: { shipmentId: shipment.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ issues });
}

export async function POST(request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user || user.group !== "customer") {
    return NextResponse.json({ error: "Sign in as a customer" }, { status: 401 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
  });
  if (!shipment || shipment.customerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = z
    .object({ message: z.string().min(3).max(2000) })
    .safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Describe the issue" }, { status: 400 });
  }
  const issue = await prisma.issue.create({
    data: { shipmentId: shipment.id, customerId: user.id, message: parsed.data.message },
    select: { id: true, status: true },
  });
  return NextResponse.json({ issue }, { status: 201 });
}
