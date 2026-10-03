import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PlanCard } from "@/components/plan-card";
import { PayForm } from "./pay-form";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
    include: {
      plans: { orderBy: { version: "desc" }, take: 1 },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!shipment || (user.group !== "admin" && shipment.customerId !== user.id)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-extrabold">Not found</h1>
        <Link href="/shipments" className="mt-4 inline-block font-bold text-violet-800 underline">
          Back to my shipments
        </Link>
      </main>
    );
  }
  const latest = shipment.plans[0] ?? null;
  const paid = shipment.status === "confirmed";
  const payable = !paid && latest?.status === "approved";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Step 4 · Payment
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
        {paid ? "Booking confirmed" : "Review & pay"}
      </h1>
      {paid ? (
        <div className="mt-4 rounded-2xl border-2 border-green-300 bg-green-50 p-5">
          <p className="font-extrabold text-green-900">
            Payment received — your booking is confirmed.
          </p>
          <p className="mt-1 text-sm text-green-800">
            {shipment.payments[0]
              ? `Receipt ${shipment.payments[0].providerRef} · ${shipment.payments[0].currency} ${shipment.payments[0].amount.toLocaleString()}`
              : ""}
            {" "}LAS Transport Limited will handle your goods. Track progress in My shipments.
          </p>
          <Link href="/shipments" className="mt-3 inline-block font-bold text-green-900 underline">
            Back to my shipments
          </Link>
        </div>
      ) : latest ? (
        <div className="mt-4">
          <PlanCard plan={{ ...latest, photos: [] }} />
          {payable ? (
            <PayForm planId={latest.id} />
          ) : (
            <p className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              This plan is {latest.status.replace("_", " ")}. Only the latest approved plan can be
              paid — {latest.status === "pending" ? "approve it first." : "ask your sales rep for a new version."}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-stone-600">No shipment plan yet.</p>
      )}
    </main>
  );
}
