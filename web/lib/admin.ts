import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "@/lib/session";
import { canManageCatalog } from "@/lib/roles";

/** Returns the signed-in general admin, or an error response. */
export async function requireGeneralAdmin(): Promise<
  { user: SessionUser } | { response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }
  if (!canManageCatalog(user)) {
    return {
      response: NextResponse.json({ error: "General admin only" }, { status: 403 }),
    };
  }
  return { user };
}
