import { describe, expect, it } from "vitest";
import { computeCharge, haversineKm } from "./pricing";

const STD = { perKmRate: 200, baseFee: 5000, minimumCharge: 10000, currency: "NGN" };

describe("computeCharge", () => {
  it("applies base + per-km", () => {
    expect(computeCharge(100, STD).charge).toBe(25000);
  });

  it("enforces the minimum charge on short trips", () => {
    expect(computeCharge(10, STD).charge).toBe(10000);
  });

  it("charges at least the minimum at zero distance", () => {
    expect(computeCharge(0, STD).charge).toBe(10000);
  });

  it("treats negative distance as zero", () => {
    expect(computeCharge(-5, STD).charge).toBe(10000);
  });
});

describe("haversineKm", () => {
  it("measures Lagos–Abuja straight-line at roughly 500–600 km", () => {
    const km = haversineKm({ lat: 6.5244, lng: 3.3792 }, { lat: 9.0579, lng: 7.4951 });
    expect(km).toBeGreaterThan(450);
    expect(km).toBeLessThan(650);
  });

  it("returns ~0 for the same point", () => {
    expect(haversineKm({ lat: 6.5, lng: 3.3 }, { lat: 6.5, lng: 3.3 })).toBe(0);
  });
});
