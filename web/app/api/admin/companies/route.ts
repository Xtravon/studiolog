import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireGeneralAdmin } from "@/lib/admin";

const companySchema = z.object({
  name: z.string().min(2).max(120),
  contact: z.string().max(300).default(""),
  active: z.boolean().optional(),
});

const LAS_ID = "las-transport-limited";

export async function GET() {
  const gate = await requireGeneralAdmin();
  if ("response" in gate) return gate.response;
  const companies = await prisma.company.findMany({
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const gate = await requireGeneralAdmin();
  if ("response" in gate) return gate.response;
  const parsed = companySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid company" }, { status: 400 });
  }
  // New companies are always non-primary options; LAS stays primary.
  const company = await prisma.company.create({
    data: { ...parsed.data, isPrimary: false },
  });
  return NextResponse.json({ company }, { status: 201 });
}

export async function PATCH(request: Request) {
  const gate = await requireGeneralAdmin();
  if ("response" in gate) return gate.response;
  const parsed = companySchema
    .partial()
    .extend({ id: z.string().min(1) })
    .safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid company" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  if (id === LAS_ID && data.active === false) {
    return NextResponse.json(
      { error: "LAS Transport Limited is the primary company and cannot be deactivated" },
      { status: 400 },
    );
  }
  try {
    const company = await prisma.company.update({ where: { id }, data });
    return NextResponse.json({ company });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
