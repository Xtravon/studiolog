import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { NewShipmentForm } from "./new-shipment-form";

export default async function NewShipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.group !== "customer") redirect("/shipments");

  const [services, companies] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.company.findMany({
      where: { active: true },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    }),
  ]);
  const preselected = (await searchParams).service ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Step 2 · Describe your goods
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
        New shipment request
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Everything saves as a draft — you can leave and come back anytime.
      </p>
      <NewShipmentForm
        services={services}
        companies={companies}
        preselectedService={services.some((s) => s.id === preselected) ? preselected : ""}
      />
    </main>
  );
}
