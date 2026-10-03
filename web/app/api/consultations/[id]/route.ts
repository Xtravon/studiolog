import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canApplyAction, consultActionSchema } from "@/lib/consultations";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const consultation = await prisma.consultation.findUnique({
    where: { id: (await params).id },
    include: { shipment: { include: { service: true, company: true } } },
  });
  if (
    !consultation ||
    (user.group !== "admin" && consultation.customerId !== user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ consultation });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const consultation = await prisma.consultation.findUnique({
    where: { id: (await params).id },
  });
  if (!consultation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = consultActionSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  if (!canApplyAction(user, consultation, parsed.data.action)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const action = parsed.data;
  const data =
    action.action === "cancel"
      ? { status: "cancelled" as const }
      : action.action === "reschedule"
        ? { scheduledAt: new Date(action.scheduledAt), callbackRequested: false }
        : action.action === "done"
          ? { status: "done" as const }
          : action.action === "no_show"
            ? { status: "no_show" as const }
            : {
                meetingLink: action.meetingLink,
                salesRepId: user.group === "admin" ? user.id : undefined,
              };
  const updated = await prisma.consultation.update({
    where: { id: consultation.id },
    data,
    select: { id: true, status: true, scheduledAt: true },
  });
  return NextResponse.json(updated);
}
