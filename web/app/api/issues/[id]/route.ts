import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canTrack } from "@/lib/tracking";

interface Ctx {
  params: Promise<{ id: string }>;
}

/** Operations/general marks a customer issue resolved. */
export async function PATCH(_request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user || !canTrack(user)) {
    return NextResponse.json({ error: "Operations staff only" }, { status: 403 });
  }
  try {
    const issue = await prisma.issue.update({
      where: { id: (await params).id },
      data: { status: "resolved" },
      select: { id: true, status: true },
    });
    return NextResponse.json({ issue });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
