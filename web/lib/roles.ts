export type Group = "customer" | "admin";
export type AdminRole = "general" | "sales_rep" | "operations";

export interface Actor {
  group: Group;
  adminRole?: AdminRole | null;
}

export function isAdmin(actor: Actor): boolean {
  return actor.group === "admin";
}

export function hasAdminRole(actor: Actor, role: AdminRole): boolean {
  return actor.group === "admin" && actor.adminRole === role;
}

/** General admins manage companies/services/pricing. */
export function canManageCatalog(actor: Actor): boolean {
  return hasAdminRole(actor, "general");
}

/** Sales reps run consultations and build shipment plans. */
export function canConsult(actor: Actor): boolean {
  return hasAdminRole(actor, "sales_rep");
}

/** Operations post tracking updates and complete shipments. */
export function canOperate(actor: Actor): boolean {
  return hasAdminRole(actor, "operations");
}
