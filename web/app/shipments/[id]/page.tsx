import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canBuildPlan } from "@/lib/plans";
import { canTrack } from "@/lib/tracking";
import { canEditShipment } from "@/lib/shipments";
import { LasNotice } from "@/components/las-notice";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { TrackingActions } from "@/components/tracking-actions";
import { IssueBox } from "@/components/issue-box";
import { PlanCard } from "@/components/plan-card";
import { PlanActions } from "@/components/plan-actions";
import { PlanBuilder } from "@/components/plan-builder";
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
    include: {
      service: true,
      company: true,
      plans: { orderBy: { version: "desc" } },
      events: { orderBy: { createdAt: "asc" } },
      issues: { orderBy: { createdAt: "desc" } },
    },
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
  const staffBuilder = canBuildPlan(user) && shipment.status === "draft";
  const photos = Array.isArray(shipment.photos) ? (shipment.photos as string[]) : [];
  const latestPlan = shipment.plans[0] ?? null;
  const showActions =
    user.group === "customer" && latestPlan?.status === "pending";
  const [services, companies] = staffBuilder
    ? await Promise.all([
        prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
        prisma.company.findMany({
          where: { active: true },
          orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
        }),
      ])
    : [[], []];

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

      <section className="mt-8">
        <h2 className="text-xl font-extrabold">Tracking & delivery</h2>
        {(shipment.status === "delivered" || shipment.status === "completed") && (
          <div className="mt-3 rounded-2xl border-2 border-green-300 bg-green-50 p-4">
            <p className="font-extrabold text-green-900">
              {shipment.status === "completed" ? "Completed" : "Delivered"} — {shipment.service?.name ?? "Shipment"}
            </p>
            <p className="mt-1 text-sm text-green-800">
              {shipment.events.length > 0
                ? `Last update: ${shipment.events[shipment.events.length - 1].message}`
                : ""}
              {" "}Find this shipment anytime in My shipments history.
            </p>
          </div>
        )}
        <TrackingTimeline status={shipment.status} events={shipment.events} />
        {canTrack(user) && shipment.status !== "draft" && (
          <TrackingActions shipmentId={shipment.id} status={shipment.status} />
        )}
        {(user.group === "customer" || canTrack(user)) && shipment.status !== "draft" && (
          <IssueBox
            shipmentId={shipment.id}
            initial={shipment.issues}
            staff={user.group === "admin"}
          />
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold">Shipment plan</h2>
        {shipment.plans.length === 0 && !staffBuilder && (
          <p className="mt-2 text-sm text-stone-600">
            Your sales representative will prepare your plan and price after the consultation.
          </p>
        )}
        {latestPlan && (
          <div className="mt-3">
            <PlanCard plan={{ ...latestPlan, photos: [] }} />
            {showActions && <PlanActions planId={latestPlan.id} shipmentId={shipment.id} />}
          </div>
        )}
        {staffBuilder && (
          <PlanBuilder
            shipmentId={shipment.id}
            services={services}
            companies={companies}
            defaults={{
              serviceId: shipment.serviceId ?? "",
              companyId: shipment.companyId ?? "",
              distanceKm: shipment.distanceKm?.toString() ?? "",
            }}
          />
        )}
        {shipment.plans.length > 1 && (
          <details className="mt-4 rounded-2xl border-2 border-stone-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-bold">
              Earlier versions ({shipment.plans.length - 1})
            </summary>
            <div className="mt-3 grid gap-3">
              {shipment.plans.slice(1).map((p) => (
                <PlanCard key={p.id} plan={{ ...p, photos: [] }} />
              ))}
            </div>
          </details>
        )}
      </section>
    </main>
  );
}
