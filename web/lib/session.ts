import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";
import type { Actor } from "./roles";

export interface SessionUser extends Actor {
  id: string;
  name: string;
  email: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, group: true, adminRole: true },
  });
  if (!dbUser) return null;
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    group: dbUser.group === "admin" ? "admin" : "customer",
    adminRole: (dbUser.adminRole ?? null) as SessionUser["adminRole"],
  };
}
