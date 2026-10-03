import { describe, expect, it } from "vitest";
import {
  canEditShipment,
  canViewShipment,
  draftSchema,
} from "./shipments";

describe("draftSchema", () => {
  it("accepts an empty draft (save and resume)", () => {
    const parsed = draftSchema.parse({});
    expect(parsed.photos).toEqual([]);
    expect(parsed.goodsDesc).toBe("");
  });

  it("rejects too many photos", () => {
    const photos = Array.from({ length: 6 }, (_, i) => `photo-${i}.jpg`);
    expect(() => draftSchema.parse({ photos })).toThrow();
  });

  it("rejects forged photo keys", () => {
    expect(() => draftSchema.parse({ photos: ["../secret.png"] })).toThrow();
    expect(() =>
      draftSchema.parse({ photos: ["ok-key_1.jpg"] }),
    ).not.toThrow();
  });

  it("rejects non-positive weight", () => {
    expect(() => draftSchema.parse({ weightKg: -2 })).toThrow();
  });
});

describe("shipment guards", () => {
  it("only lets the owning customer edit a draft", () => {
    expect(
      canEditShipment({ id: "u1", group: "customer", status: "draft", customerId: "u1" }),
    ).toBe(true);
    expect(
      canEditShipment({ id: "u2", group: "customer", status: "draft", customerId: "u1" }),
    ).toBe(false);
    expect(
      canEditShipment({ id: "u1", group: "admin", status: "draft", customerId: "u1" }),
    ).toBe(false);
  });

  it("lets admins view any shipment", () => {
    expect(canViewShipment({ id: "a", group: "admin", customerId: "u1" })).toBe(true);
    expect(canViewShipment({ id: "u1", group: "customer", customerId: "u1" })).toBe(true);
    expect(canViewShipment({ id: "u2", group: "customer", customerId: "u1" })).toBe(false);
  });
});
