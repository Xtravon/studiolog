// Generates prisma/schema.postgres.prisma from prisma/schema.prisma.
// Usage: npm run db:schema:pg
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("./schema.prisma", import.meta.url), "utf8");
if (!src.includes('provider = "sqlite"')) {
  throw new Error("sqlite provider line not found — schema layout changed?");
}
const twin = src
  .replace(
    "// StudioLog — Phase 0 schema.",
    "// StudioLog — Postgres twin for production (Neon). GENERATED — do not edit; edit schema.prisma then run npm run db:schema:pg.",
  )
  .replace('provider = "sqlite"', 'provider = "postgresql"');
writeFileSync(new URL("./schema.postgres.prisma", import.meta.url), twin, "utf8");
console.log("wrote prisma/schema.postgres.prisma");
