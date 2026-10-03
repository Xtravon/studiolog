import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canManageCatalog } from "@/lib/roles";
import { PricingForm } from "./pricing-form";

export default async function PricingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (!canManageCatalog(user)) redirect("/admin");
  const pricing = await prisma.pricingConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">Admin · Pricing</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Distance-based charges</h1>
      <p className="mt-1 text-sm text-stone-600">
        Charge = max(minimum, base fee + per-km rate × distance). Changes apply to new quotes;
        approved shipment plans keep their snapshot price.
      </p>
      <PricingForm
        initial={{
          perKmRate: pricing?.perKmRate ?? 200,
          baseFee: pricing?.baseFee ?? 5000,
          minimumCharge: pricing?.minimumCharge ?? 10000,
          currency: pricing?.currency ?? "NGN",
        }}
      />
    </main>
  );
}
