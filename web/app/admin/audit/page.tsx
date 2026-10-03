import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canManageCatalog } from "@/lib/roles";

export default async function AuditPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (!canManageCatalog(user)) redirect("/admin");
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Admin · Audit log
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Who changed what</h1>
      <div className="mt-6 grid gap-2">
        {logs.map((l) => (
          <div key={l.id} className="rounded-xl border border-stone-200 bg-white p-3 text-sm">
            <strong>{l.action}</strong> · {l.entity}
            {l.entityId ? ` ${l.entityId.slice(0, 8)}` : ""}
            {l.detail ? ` — ${l.detail}` : ""}
            <span className="block text-xs text-stone-500">
              {l.createdAt.toLocaleString()}
            </span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-stone-600">No audited actions yet.</p>}
      </div>
    </main>
  );
}
