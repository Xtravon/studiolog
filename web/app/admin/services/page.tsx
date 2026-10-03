import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canManageCatalog } from "@/lib/roles";
import { ServiceManager } from "./service-manager";

export default async function ServicesAdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (!canManageCatalog(user)) redirect("/admin");
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">Admin · Services</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Services</h1>
      <ServiceManager initial={services} />
    </main>
  );
}
