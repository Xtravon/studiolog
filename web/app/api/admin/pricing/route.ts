import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireGeneralAdmin } from "@/lib/admin";

const pricingSchema = z.object({
  perKmRate: z.number().nonnegative().max(1_000_000),
  baseFee: z.number().nonnegative().max(100_000_000),
  minimumCharge: z.number().nonnegative().max(100_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/),
});

export async function GET() {
  const gate = await requireGeneralAdmin();
  if ("response" in gate) return gate.response;
  const pricing =
    (await prisma.pricingConfig.findFirst({ orderBy: { updatedAt: "desc" } })) ??
    (await prisma.pricingConfig.create({
      data: { perKmRate: 200, baseFee: 5000, minimumCharge: 10000, currency: "NGN" },
    }));
  return NextResponse.json({ pricing });
}

export async function PATCH(request: Request) {
  const gate = await requireGeneralAdmin();
  if ("response" in gate) return gate.response;
  const parsed = pricingSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pricing" }, { status: 400 });
  }
  const pricing = await prisma.pricingConfig.create({
    data: { ...parsed.data, updatedBy: gate.user.id },
  });
  return NextResponse.json({ pricing });
}
