/** Ordered tracking milestones (PRD 6.8), each with plain-language copy. */
export const MILESTONES = [
  { key: "confirmed", label: "Booking confirmed", message: "Booking confirmed — payment received." },
  { key: "pickup_scheduled", label: "Pickup scheduled", message: "Pickup scheduled — we will arrive at the agreed time." },
  { key: "collected", label: "Goods collected", message: "Goods collected by LAS Transport Limited." },
  { key: "in_transit", label: "In transit", message: "Your goods are on the way." },
  { key: "near_destination", label: "Near destination", message: "Almost there — goods are near the destination." },
  { key: "delivered", label: "Delivered", message: "Delivered — goods handed over at the destination." },
  { key: "completed", label: "Completed", message: "Completed — thank you for shipping with StudioLog." },
] as const;

export type MilestoneKey = (typeof MILESTONES)[number]["key"];

const ORDER = MILESTONES.map((m) => m.key);

/** Forward-only transitions; cancellation allowed before delivery. */
export function allowedNext(status: string): string[] {
  switch (status) {
    case "confirmed":
      return ["pickup_scheduled", "cancelled"];
    case "pickup_scheduled":
      return ["collected", "cancelled"];
    case "collected":
      return ["in_transit", "cancelled"];
    case "in_transit":
      return ["near_destination", "cancelled"];
    case "near_destination":
      return ["delivered"];
    case "delivered":
      return ["completed"];
    default:
      return [];
  }
}

export function canAdvance(from: string, to: string): boolean {
  return allowedNext(from).includes(to);
}

export function defaultMessage(milestone: string): string {
  if (milestone === "cancelled") return "Shipment cancelled. Contact support if you need help.";
  return MILESTONES.find((m) => m.key === milestone)?.message ?? milestone;
}

export function milestoneIndex(status: string): number {
  return ORDER.indexOf(status as MilestoneKey);
}

/** Only operations (or general) staff may post tracking updates. */
export function canTrack(actor: { group: string; adminRole?: string | null }): boolean {
  return (
    actor.group === "admin" &&
    (actor.adminRole === "operations" || actor.adminRole === "general")
  );
}
