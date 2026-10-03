import { describe, expect, it } from "vitest";
import { checkPayable } from "./payments";

const base = {
  id: "p1",
  shipmentId: "s1",
  version: 2,
  status: "approved",
  totalPrice: 17000,
  currency: "NGN",
  shipmentStatus: "draft",
  shipmentCustomerId: "u1",
  latestVersion: 2,
};
const owner = { group: "customer", id: "u1" };

describe("checkPayable", () => {
  it("allows the owner to pay the latest approved plan", () => {
    const r = checkPayable(owner, base);
    expect(r).toEqual({
      ok: true,
      amount: 17000,
      currency: "NGN",
      providerRef: "test_p1_v2",
    });
  });

  it("blocks unapproved or stale plans", () => {
    expect(checkPayable(owner, { ...base, status: "pending" }).ok).toBe(false);
    expect(checkPayable(owner, { ...base, latestVersion: 3 }).ok).toBe(false);
  });

  it("blocks paid shipments and strangers", () => {
    expect(checkPayable(owner, { ...base, shipmentStatus: "confirmed" }).ok).toBe(false);
    expect(checkPayable({ group: "customer", id: "u2" }, base).ok).toBe(false);
    expect(checkPayable({ group: "admin", id: "a1" }, base).ok).toBe(false);
  });
});
