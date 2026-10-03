import { describe, expect, it } from "vitest";
import { funnelMath } from "./insights";

describe("funnelMath", () => {
  it("computes conversion rates", () => {
    const f = funnelMath({
      requests: 10,
      consultations: 8,
      approvals: 4,
      payments: 4,
      delivered: 3,
      bookHours: [24, 48],
      openIssues: 1,
    });
    expect(f.requestToConsult).toBe(80);
    expect(f.consultToApprove).toBe(50);
    expect(f.approveToPay).toBe(100);
    expect(f.avgHoursToBook).toBe(36);
  });

  it("handles zeros without NaN", () => {
    const f = funnelMath({
      requests: 0,
      consultations: 0,
      approvals: 0,
      payments: 0,
      delivered: 0,
      bookHours: [],
      openIssues: 0,
    });
    expect(f.requestToConsult).toBe(0);
    expect(f.avgHoursToBook).toBeNull();
  });
});
