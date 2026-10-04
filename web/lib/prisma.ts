import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const log: ("warn" | "error")[] = ["warn", "error"];

function sqlitePath(): string {
  // Absolute DATABASE_URL is honored as-is. Otherwise the database always
  // lives at <web>/data/studiolog.db (statically scoped for the bundler).
  const raw = (process.env.DATABASE_URL ?? "").replace(/^file:/, "");
  if (path.isAbsolute(raw)) return raw;
  return path.join(process.cwd(), "data", "studiolog.db");
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";
  // Production (Neon Postgres) on Netlify; local SQLite everywhere else.
  if (/^postgres(ql)?:\/\//.test(url)) {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: url }),
      log,
    });
  }
  const adapter = new PrismaBetterSqlite3({ url: sqlitePath() });
  return new PrismaClient({ adapter, log });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
