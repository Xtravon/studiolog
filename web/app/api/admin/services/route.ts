import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireGeneralAdmin } from "@/lib/admin";

const serviceSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).default(""),
  includes: z.string().max(2000).default(""),
  active: z.boolean().optional(),
});

export async function GET() {
  const gate = await requireGeneralAdmin();
  if ("response" in gate) return gate.response;
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const gate = await requireGeneralAdmin();
  if ("response" in gate) return gate.response;
  const parsed = serviceSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }
  const service = await prisma.service.create({ data: parsed.data });
  return NextResponse.json({ service }, { status: 201 });
}

export async function PATCH(request: Request) {
  const gate = await requireGeneralAdmin();
  if ("response" in gate) return gate.response;
  const parsed = serviceSchema
    .partial()
    .extend({ id: z.string().min(1) })
    .safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  try {
    const service = await prisma.service.update({ where: { id }, data });
    return NextResponse.json({ service });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
