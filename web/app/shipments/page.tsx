import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function ShipmentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.group !== "customer") redirect("/admin/shipments");
  const shipments = await prisma.shipment.findMany({
    where: { customerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { service: true, company: true },
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
            My shipments
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Drafts & requests
          </h1>
        </div>
        <Link
          href="/shipments/new"
          className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-extrabold text-white shadow"
        >
          + New shipment
        </Link>
      </div>
      <div className="mt-6 grid gap-3">
        {shipments.map((s) => (
          <Link
            key={s.id}
            href={`/shipments/${s.id}`}
            className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow hover:border-orange-400"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{s.service?.name ?? "Service not chosen yet"}</strong>
              <span className="rounded-full border-2 border-violet-300 bg-violet-100 px-3 py-0.5 text-xs font-extrabold text-violet-950">
                {s.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-600">
              {s.goodsDesc || "No goods described yet"} ·{" "}
              {s.pickupAddr && s.deliveryAddr
                ? `${s.pickupAddr} → ${s.deliveryAddr}`
                : "Route not set yet"}
            </p>
            {s.company?.isPrimary && (
              <p className="mt-1 text-xs font-bold text-amber-800">
                ★ Handled by LAS Transport Limited
              </p>
            )}
          </Link>
        ))}
        {shipments.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center">
            <p className="font-bold">No shipments yet</p>
            <p className="mt-1 text-sm text-stone-600">
              Start one — your progress saves as a draft you can resume anytime.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-block rounded-xl border-2 border-violet-600 bg-white px-4 py-2.5 text-sm font-extrabold text-violet-950"
            >
              Browse services
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
