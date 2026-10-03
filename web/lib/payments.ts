export interface PayablePlan {
  id: string;
  shipmentId: string;
  version: number;
  status: string;
  totalPrice: number;
  currency: string;
  shipmentStatus: string;
  shipmentCustomerId: string;
  latestVersion: number;
}

export type PayCheck =
  | { ok: true; amount: number; currency: string; providerRef: string }
  | { ok: false; code: number; error: string };

/** Approve-before-pay gate (PRD 6.7 + core rules). */
export function checkPayable(
  actor: { group: string; id: string },
  plan: PayablePlan,
): PayCheck {
  if (actor.group !== "customer" || actor.id !== plan.shipmentCustomerId) {
    return { ok: false, code: 403, error: "Not allowed" };
  }
  if (plan.shipmentStatus !== "draft") {
    return { ok: false, code: 409, error: "Shipment is no longer payable" };
  }
  if (plan.status !== "approved" || plan.version !== plan.latestVersion) {
    return {
      ok: false,
      code: 409,
      error: "Only the latest approved plan can be paid",
    };
  }
  return {
    ok: true,
    amount: plan.totalPrice,
    currency: plan.currency,
    providerRef: `test_${plan.id}_v${plan.version}`,
  };
}
