import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canManageCatalog } from "@/lib/roles";
import { CompanyManager } from "./company-manager";

export default async function CompaniesAdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (!canManageCatalog(user)) redirect("/admin");
  const companies = await prisma.company.findMany({
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">Admin · Companies</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Logistics companies</h1>
      <p className="mt-1 text-sm text-stone-600">
        LAS Transport Limited is locked as the primary company and handler of goods.
      </p>
      <CompanyManager initial={companies} />
    </main>
  );
}
