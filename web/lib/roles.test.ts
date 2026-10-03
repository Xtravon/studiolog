import { describe, expect, it } from "vitest";
import {
  canConsult,
  canManageCatalog,
  canOperate,
  isAdmin,
  type Actor,
} from "./roles";

const customer: Actor = { group: "customer" };
const general: Actor = { group: "admin", adminRole: "general" };
const salesRep: Actor = { group: "admin", adminRole: "sales_rep" };
const ops: Actor = { group: "admin", adminRole: "operations" };
const roleless: Actor = { group: "admin", adminRole: null };

describe("roles", () => {
  it("identifies admins", () => {
    expect(isAdmin(customer)).toBe(false);
    expect(isAdmin(general)).toBe(true);
  });

  it("scopes catalog management to general admins", () => {
    expect(canManageCatalog(general)).toBe(true);
    expect(canManageCatalog(salesRep)).toBe(false);
    expect(canManageCatalog(customer)).toBe(false);
  });

  it("scopes consultations to sales reps", () => {
    expect(canConsult(salesRep)).toBe(true);
    expect(canConsult(ops)).toBe(false);
    expect(canConsult(roleless)).toBe(false);
  });

  it("scopes operations to the operations role", () => {
    expect(canOperate(ops)).toBe(true);
    expect(canOperate(general)).toBe(false);
    expect(canOperate(customer)).toBe(false);
  });
});
