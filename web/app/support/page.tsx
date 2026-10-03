import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function SupportPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.group !== "customer") redirect("/admin");
  const issues = await prisma.issue.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { shipment: { select: { id: true, service: { select: { name: true } } } } },
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">Support</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Help & issues</h1>
      <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-white p-5 shadow">
        <p className="text-sm text-stone-600">
          Questions about service choice, price, goods handling, or tracking? Report an issue on
          the shipment page, or contact support at{" "}
          <strong className="text-stone-900">support@studiolog.local</strong>.
        </p>
      </div>
      <h2 className="mt-6 font-extrabold">My reported issues</h2>
      <div className="mt-3 grid gap-2">
        {issues.map((i) => (
          <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white border border-stone-200 p-3 text-sm">
            <span>
              {i.message} ·{" "}
              <Link href={`/shipments/${i.shipment.id}`} className="font-bold text-violet-800 underline">
                {i.shipment.service?.name ?? "Shipment"}
              </Link>
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${i.status === "open" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              {i.status.toUpperCase()}
            </span>
          </div>
        ))}
        {issues.length === 0 && <p className="text-sm text-stone-600">No issues reported.</p>}
      </div>
    </main>
  );
}
