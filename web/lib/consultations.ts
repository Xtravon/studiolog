import { z } from "zod";

export const MODES = ["phone", "video"] as const;
export const TERMINAL = ["done", "cancelled", "no_show"] as const;

const futureDate = z
  .string()
  .datetime({ offset: true })
  .refine((s) => new Date(s).getTime() > Date.now() + 30 * 60 * 1000, {
    message: "Appointment must be at least 30 minutes in the future",
  });

export const bookSchema = z
  .object({
    shipmentId: z.string().min(1),
    mode: z.enum(MODES).default("phone"),
    scheduledAt: futureDate.nullable().optional(),
    note: z.string().max(500).default(""),
    callbackRequested: z.boolean().default(false),
  })
  .refine(
    (v) => v.callbackRequested || v.scheduledAt != null,
    { message: "Pick a time, or request a callback instead" },
  );

export type BookInput = z.infer<typeof bookSchema>;

export const consultActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reschedule"), scheduledAt: futureDate }),
  z.object({ action: z.literal("done") }),
  z.object({ action: z.literal("no_show") }),
  z.object({ action: z.literal("link"), meetingLink: z.string().max(500) }),
]);

export type ConsultAction = z.infer<typeof consultActionSchema>;

/** Who may apply an action, given role/ownership and current status. */
export function canApplyAction(
  actor: { group: string; adminRole?: string | null; id: string },
  consult: { status: string; customerId: string },
  action: ConsultAction["action"],
): boolean {
  const isOwner = actor.group === "customer" && consult.customerId === actor.id;
  const isStaff =
    actor.group === "admin" &&
    (actor.adminRole === "sales_rep" || actor.adminRole === "general");
  if (consult.status !== "booked") return false;
  switch (action) {
    case "cancel":
    case "reschedule":
      return isOwner || isStaff;
    case "done":
    case "no_show":
    case "link":
      return isStaff;
  }
}
