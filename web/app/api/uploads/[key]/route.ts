import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { readUpload } from "@/lib/uploads";

interface Ctx {
  params: Promise<{ key: string }>;
}

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const { key } = await params;
  if (!/^[A-Za-z0-9_-]+\.jpg$/.test(key)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.group !== "admin") {
    // Confirm one of this customer's shipments references the key.
    const refs = await prisma.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*) AS n FROM Shipment
      WHERE customerId = ${user.id} AND photos LIKE ${`%"${key}"%`}`;
    if (!refs[0]?.n) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }
  const bytes = await readUpload(key);
  if (!bytes) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(bytes), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" },
  });
}
