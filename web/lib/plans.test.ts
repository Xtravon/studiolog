import { describe, expect, it } from "vitest";
import { canBuildPlan, canReviewPlan, isActionable, nextVersion } from "./plans";

describe("plan guards", () => {
  const rep = { group: "admin", adminRole: "sales_rep", id: "a1" };
  const general = { group: "admin", adminRole: "general" };
  const ops = { group: "admin", adminRole: "operations" };
  const owner = { group: "customer", id: "u1" };
  const other = { group: "customer", id: "u2" };

  it("lets sales staff build versions", () => {
    expect(canBuildPlan(rep)).toBe(true);
    expect(canBuildPlan(general)).toBe(true);
    expect(canBuildPlan(ops)).toBe(false);
    expect(canBuildPlan(owner)).toBe(false);
  });

  it("lets only the owning customer review", () => {
    expect(canReviewPlan(owner, { customerId: "u1" })).toBe(true);
    expect(canReviewPlan(other, { customerId: "u1" })).toBe(false);
    expect(canReviewPlan(rep, { customerId: "u1" })).toBe(false);
  });

  it("makes only the latest pending version actionable", () => {
    expect(isActionable({ status: "pending", version: 2 }, 2)).toBe(true);
    expect(isActionable({ status: "pending", version: 1 }, 2)).toBe(false);
    expect(isActionable({ status: "approved", version: 2 }, 2)).toBe(false);
  });

  it("numbers versions sequentially", () => {
    expect(nextVersion([])).toBe(1);
    expect(nextVersion([1, 2])).toBe(3);
  });
});
