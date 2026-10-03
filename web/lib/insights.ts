import { prisma } from "./prisma";

export type EventType =
  | "shipment.created"
  | "consultation.booked"
  | "consultation.done"
  | "plan.approved"
  | "payment.succeeded"
  | "shipment.delivered"
  | "shipment.completed";

export async function trackEvent(
  type: EventType,
  opts: { shipmentId?: string; userId?: string; data?: object } = {},
): Promise<void> {
  await prisma.analyticsEvent.create({
    data: {
      type,
      shipmentId: opts.shipmentId,
      userId: opts.userId,
      data: JSON.stringify(opts.data ?? {}),
    },
  });
}

export async function audit(
  actorId: string | undefined,
  action: string,
  entity: string,
  entityId?: string,
  detail = "",
): Promise<void> {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, detail },
  });
}

export interface Funnel {
  requests: number;
  consultations: number;
  approvals: number;
  payments: number;
  delivered: number;
  requestToConsult: number;
  consultToApprove: number;
  approveToPay: number;
  avgHoursToBook: number | null;
  openIssues: number;
}

/** Pure funnel math over event counts (tested below). */
export function funnelMath(input: {
  requests: number;
  consultations: number;
  approvals: number;
  payments: number;
  delivered: number;
  bookHours: number[];
  openIssues: number;
}): Funnel {
  const rate = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 1000) / 10);
  const avg =
    input.bookHours.length === 0
      ? null
      : Math.round((input.bookHours.reduce((s, h) => s + h, 0) / input.bookHours.length) * 10) / 10;
  return {
    requests: input.requests,
    consultations: input.consultations,
    approvals: input.approvals,
    payments: input.payments,
    delivered: input.delivered,
    requestToConsult: rate(input.consultations, input.requests),
    consultToApprove: rate(input.approvals, input.consultations),
    approveToPay: rate(input.payments, input.approvals),
    avgHoursToBook: avg,
    openIssues: input.openIssues,
  };
}

export async function funnel(): Promise<Funnel> {
  const [requests, consultations, approvals, payments, delivered, openIssues] =
    await Promise.all([
      prisma.shipment.count(),
      prisma.consultation.count({ where: { status: { not: "cancelled" } } }),
      prisma.shipmentPlan.count({ where: { status: "approved" } }),
      prisma.payment.count({ where: { status: "success" } }),
      prisma.shipment.count({ where: { status: { in: ["delivered", "completed"] } } }),
      prisma.issue.count({ where: { status: "open" } }),
    ]);
  const paid = await prisma.payment.findMany({
    where: { status: "success" },
    select: { createdAt: true, shipment: { select: { createdAt: true } } },
  });
  const bookHours = paid.map(
    (p) => (p.createdAt.getTime() - p.shipment.createdAt.getTime()) / 3600000,
  );
  return funnelMath({ requests, consultations, approvals, payments, delivered, bookHours, openIssues });
}
