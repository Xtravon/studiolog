import { describe, expect, it } from "vitest";
import { bookSchema, canApplyAction } from "./consultations";

const future = new Date(Date.now() + 86400000).toISOString();
const past = new Date(Date.now() - 86400000).toISOString();

describe("bookSchema", () => {
  it("accepts a future appointment", () => {
    const r = bookSchema.parse({ shipmentId: "s1", mode: "video", scheduledAt: future });
    expect(r.callbackRequested).toBe(false);
  });

  it("rejects past times", () => {
    expect(() =>
      bookSchema.parse({ shipmentId: "s1", scheduledAt: past }),
    ).toThrow();
  });

  it("accepts a callback request without a time", () => {
    const r = bookSchema.parse({ shipmentId: "s1", callbackRequested: true });
    expect(r.scheduledAt ?? null).toBeNull();
  });

  it("requires either a time or callback", () => {
    expect(() => bookSchema.parse({ shipmentId: "s1" })).toThrow();
  });
});

describe("canApplyAction", () => {
  const booked = { status: "booked", customerId: "u1" };
  const done = { status: "done", customerId: "u1" };
  const owner = { group: "customer", id: "u1" };
  const stranger = { group: "customer", id: "u2" };
  const rep = { group: "admin", adminRole: "sales_rep", id: "a1" };
  const ops = { group: "admin", adminRole: "operations", id: "a2" };

  it("lets owners cancel/reschedule their booked consults", () => {
    expect(canApplyAction(owner, booked, "cancel")).toBe(true);
    expect(canApplyAction(owner, booked, "reschedule")).toBe(true);
    expect(canApplyAction(stranger, booked, "cancel")).toBe(false);
  });

  it("restricts completion to sales staff", () => {
    expect(canApplyAction(rep, booked, "done")).toBe(true);
    expect(canApplyAction(owner, booked, "done")).toBe(false);
    expect(canApplyAction(ops, booked, "done")).toBe(false);
  });

  it("blocks all actions once terminal", () => {
    expect(canApplyAction(owner, done, "cancel")).toBe(false);
    expect(canApplyAction(rep, done, "done")).toBe(false);
  });
});
