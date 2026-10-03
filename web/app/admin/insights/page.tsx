import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { canManageCatalog } from "@/lib/roles";
import { funnel } from "@/lib/insights";

export default async function InsightsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (!canManageCatalog(user)) redirect("/admin");
  const f = await funnel();
  const rows: [string, string][] = [
    ["Shipment requests", String(f.requests)],
    ["Requests → consultations", `${f.requestToConsult}% (${f.consultations})`],
    ["Consultations → approvals", `${f.consultToApprove}% (${f.approvals})`],
    ["Approvals → paid", `${f.approveToPay}% (${f.payments})`],
    ["Delivered", String(f.delivered)],
    ["Avg time request → paid", f.avgHoursToBook == null ? "—" : `${f.avgHoursToBook} h`],
    ["Open support issues", String(f.openIssues)],
  ];
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Admin · Success measures
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Insights</h1>
      <p className="mt-1 text-sm text-stone-600">
        PRD §9 funnel: requests that lead to consultations, approvals, payment, and delivery.
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow">
            <dt className="text-sm text-stone-600">{k}</dt>
            <dd className="text-2xl font-extrabold">{v}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
