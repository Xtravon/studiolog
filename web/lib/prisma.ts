import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

function dbPath(): string {
  // Absolute DATABASE_URL is honored as-is. Otherwise the database always
  // lives at <web>/data/studiolog.db (statically scoped for the bundler).
  const raw = (process.env.DATABASE_URL ?? "").replace(/^file:/, "");
  if (path.isAbsolute(raw)) return raw;
  return path.join(process.cwd(), "data", "studiolog.db");
}

function createClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: dbPath() });
  return new PrismaClient({ adapter, log: ["warn", "error"] });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
