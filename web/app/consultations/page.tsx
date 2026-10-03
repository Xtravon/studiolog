import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { ConsultationManager } from "./consultation-manager";

export default async function ConsultationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.group !== "customer") redirect("/admin/consultations");
  const [drafts, consultations] = await Promise.all([
    prisma.shipment.findMany({
      where: { customerId: user.id, status: "draft" },
      orderBy: { updatedAt: "desc" },
      include: { service: true },
    }),
    prisma.consultation.findMany({
      where: { customerId: user.id },
      orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
      include: { shipment: { include: { service: true } } },
    }),
  ]);
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Step 3 · Talk to a sales rep
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Consultations</h1>
      <p className="mt-1 text-sm text-stone-600">
        Book a phone or video call to confirm your service, goods, and price. No time works? Request a callback.
      </p>
      <ConsultationManager
        drafts={drafts.map((d) => ({
          id: d.id,
          label: `${d.service?.name ?? "Shipment"} — ${d.goodsDesc || d.id.slice(0, 8)}`,
        }))}
        initial={consultations.map((c) => ({
          id: c.id,
          mode: c.mode,
          scheduledAt: c.scheduledAt?.toISOString() ?? null,
          meetingLink: c.meetingLink,
          note: c.note,
          status: c.status,
          callbackRequested: c.callbackRequested,
          shipmentLabel: c.shipment.service?.name ?? "Shipment",
        }))}
      />
    </main>
  );
}
