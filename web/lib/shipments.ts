import { z } from "zod";

export const MAX_PHOTOS = 5;

export const photoKeySchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]+\.jpg$/, "Invalid photo reference");

export const draftSchema = z.object({
  serviceId: z.string().min(1).nullable().optional(),
  companyId: z.string().min(1).nullable().optional(),
  goodsDesc: z.string().max(2000).default(""),
  quantity: z.string().max(200).default(""),
  weightKg: z.number().positive().max(100_000).nullable().optional(),
  dimensions: z.string().max(200).default(""),
  photos: z.array(photoKeySchema).max(MAX_PHOTOS).default([]),
  handlingNotes: z.string().max(2000).default(""),
  pickupAddr: z.string().max(500).default(""),
  deliveryAddr: z.string().max(500).default(""),
  pickupTimePref: z.string().max(300).default(""),
});

export type DraftInput = z.infer<typeof draftSchema>;
export const draftPatchSchema = draftSchema.partial();

export function canEditShipment(actor: {
  id: string;
  group: string;
  status: string;
  customerId: string;
}): boolean {
  return (
    actor.group === "customer" &&
    actor.customerId === actor.id &&
    actor.status === "draft"
  );
}

export function canViewShipment(actor: {
  id: string;
  group: string;
  customerId: string;
}): boolean {
  return actor.group === "admin" || actor.customerId === actor.id;
}
