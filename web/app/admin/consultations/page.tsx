import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { StaffConsultations } from "./staff-consultations";

export default async function StaffConsultationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.group !== "admin" || (user.adminRole !== "sales_rep" && user.adminRole !== "general")) {
    redirect(user.group === "customer" ? "/consultations" : "/admin");
  }
  const consultations = await prisma.consultation.findMany({
    orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
    include: {
      shipment: {
        include: {
          service: true,
          company: true,
        },
      },
    },
    take: 100,
  });
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Sales desk
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Consultations</h1>
      <p className="mt-1 text-sm text-stone-600">
        Review each customer&apos;s service selection and shipment details before the call.
      </p>
      <StaffConsultations
        initial={consultations.map((c) => ({
          id: c.id,
          mode: c.mode,
          scheduledAt: c.scheduledAt?.toISOString() ?? null,
          meetingLink: c.meetingLink,
          note: c.note,
          status: c.status,
          callbackRequested: c.callbackRequested,
          customerId: c.customerId,
          service: c.shipment.service?.name ?? "—",
          company: c.shipment.company?.name ?? "—",
          goods: c.shipment.goodsDesc || "—",
          route:
            c.shipment.pickupAddr && c.shipment.deliveryAddr
              ? `${c.shipment.pickupAddr} → ${c.shipment.deliveryAddr}`
              : "—",
        }))}
      />
    </main>
  );
}
