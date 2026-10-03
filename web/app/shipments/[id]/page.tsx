import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canEditShipment } from "@/lib/shipments";
import { LasNotice } from "@/components/las-notice";
import { EditShipmentForm } from "./edit-shipment-form";

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
    include: { service: true, company: true },
  });
  if (
    !shipment ||
    (user.group !== "admin" && shipment.customerId !== user.id)
  ) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-extrabold">Not found</h1>
        <p className="mt-2 text-sm text-stone-600">
          This shipment does not exist or belongs to someone else.
        </p>
        <Link href="/shipments" className="mt-4 inline-block font-bold text-violet-800 underline">
          Back to my shipments
        </Link>
      </main>
    );
  }

  const editable = canEditShipment({
    ...user,
    status: shipment.status,
    customerId: shipment.customerId,
  });
  const photos = Array.isArray(shipment.photos) ? (shipment.photos as string[]) : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Shipment · {shipment.status.toUpperCase()}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
        {shipment.service?.name ?? "Service not chosen yet"}
      </h1>
      <div className="mt-4">
        <LasNotice />
      </div>
      {editable && (
        <div className="mt-4">
          <Link
            href="/consultations"
            className="inline-block rounded-xl border-2 border-violet-600 bg-white px-4 py-2.5 text-sm font-extrabold text-violet-950"
          >
            Book a phone / video consultation →
          </Link>
        </div>
      )}
      {editable ? (
        <EditShipmentForm
          id={shipment.id}
          services={await prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } })}
          companies={await prisma.company.findMany({
            where: { active: true },
            orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
          })}
          initial={{
            serviceId: shipment.serviceId ?? "",
            companyId: shipment.companyId ?? "",
            goodsDesc: shipment.goodsDesc,
            quantity: shipment.quantity,
            weightKg: shipment.weightKg?.toString() ?? "",
            dimensions: shipment.dimensions,
            handlingNotes: shipment.handlingNotes,
            pickupAddr: shipment.pickupAddr,
            deliveryAddr: shipment.deliveryAddr,
            pickupTimePref: shipment.pickupTimePref,
            photos,
          }}
        />
      ) : (
        <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-white p-5 shadow">
          <p className="text-sm text-stone-600">
            This shipment is {shipment.status} and can no longer be edited here.
          </p>
        </div>
      )}
    </main>
  );
}
