import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function AdminShipmentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.group !== "admin") redirect("/shipments");
  const shipments = await prisma.shipment.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      service: { select: { name: true } },
      customer: { select: { email: true } },
    },
  });
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Staff · All shipments
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Shipments</h1>
      <p className="mt-1 text-sm text-stone-600">
        Open a shipment to review details, build plans, or post tracking updates.
      </p>
      <div className="mt-6 grid gap-3">
        {shipments.map((s) => (
          <Link
            key={s.id}
            href={`/shipments/${s.id}`}
            className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow hover:border-orange-400"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{s.service?.name ?? "No service yet"}</strong>
              <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-extrabold text-violet-950">
                {s.status.toUpperCase().replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-600">
              {s.customer.email} · {s.goodsDesc || "No goods described yet"}
            </p>
          </Link>
        ))}
        {shipments.length === 0 && (
          <p className="text-sm text-stone-600">No shipments yet.</p>
        )}
      </div>
    </main>
  );
}
