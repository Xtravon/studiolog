import { describe, expect, it } from "vitest";
import { allowedNext, canAdvance, canTrack, defaultMessage } from "./tracking";

describe("tracking transitions", () => {
  it("advances forward one milestone at a time", () => {
    expect(canAdvance("confirmed", "pickup_scheduled")).toBe(true);
    expect(canAdvance("confirmed", "in_transit")).toBe(false);
    expect(canAdvance("in_transit", "near_destination")).toBe(true);
  });

  it("allows cancellation before delivery only", () => {
    expect(canAdvance("in_transit", "cancelled")).toBe(true);
    expect(canAdvance("near_destination", "cancelled")).toBe(false);
    expect(canAdvance("delivered", "completed")).toBe(true);
  });

  it("ends at completed", () => {
    expect(allowedNext("completed")).toEqual([]);
    expect(allowedNext("draft")).toEqual([]);
  });

  it("explains every milestone in plain language", () => {
    expect(defaultMessage("collected")).toContain("LAS Transport Limited");
    expect(defaultMessage("cancelled")).toContain("cancelled");
  });

  it("restricts posting to operations staff", () => {
    expect(canTrack({ group: "admin", adminRole: "operations" })).toBe(true);
    expect(canTrack({ group: "admin", adminRole: "general" })).toBe(true);
    expect(canTrack({ group: "admin", adminRole: "sales_rep" })).toBe(false);
    expect(canTrack({ group: "customer" })).toBe(false);
  });
});
