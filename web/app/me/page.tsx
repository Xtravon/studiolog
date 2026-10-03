import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

const ROLE_LABEL: Record<string, string> = {
  general: "General Admin",
  sales_rep: "Sales Representative / Consultant",
  operations: "Operations",
};

export default async function MePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Signed in
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
        {user.name}
      </h1>
      <p className="mt-1 text-sm text-stone-600">{user.email}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border-2 border-violet-300 bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-950">
          {user.group === "admin" ? "ADMIN" : "CUSTOMER"}
        </span>
        {user.group === "admin" && user.adminRole && (
          <span className="rounded-full border-2 border-amber-400 bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
            {ROLE_LABEL[user.adminRole] ?? user.adminRole}
          </span>
        )}
      </div>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  );
}
