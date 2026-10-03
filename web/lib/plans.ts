export type PlanStatus = "pending" | "approved" | "correction_requested" | "superseded";

export interface Plan {
  id: string;
  shipmentId: string;
  version: number;
  status: PlanStatus;
  customerId: string;
}

/** Only sales staff may build plan versions. */
export function canBuildPlan(actor: { group: string; adminRole?: string | null }): boolean {
  return (
    actor.group === "admin" &&
    (actor.adminRole === "sales_rep" || actor.adminRole === "general")
  );
}

/** Only the owning customer may approve or request corrections. */
export function canReviewPlan(
  actor: { group: string; id: string },
  plan: { customerId: string },
): boolean {
  return actor.group === "customer" && actor.id === plan.customerId;
}

/** Only the latest pending version is actionable; approving anything else is a conflict. */
export function isActionable(
  plan: { status: PlanStatus; version: number },
  latestVersion: number,
): boolean {
  return plan.status === "pending" && plan.version === latestVersion;
}

/** Next version number given existing versions. */
export function nextVersion(versions: number[]): number {
  return versions.length === 0 ? 1 : Math.max(...versions) + 1;
}
