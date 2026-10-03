import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { canManageCatalog } from "@/lib/roles";

const LINKS = [
  { href: "/admin/consultations", title: "Consultations", desc: "Sales desk: upcoming calls, links, attendance." },
  { href: "/admin/pricing", title: "Distance pricing", desc: "Per-km rate, base fee, minimum charge, currency." },
  { href: "/admin/services", title: "Services", desc: "Add services, edit details, activate or hide." },
  { href: "/admin/companies", title: "Logistics companies", desc: "Add company options. LAS stays primary." },
];

export default async function AdminHub() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (!canManageCatalog(user)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-extrabold">Admin</h1>
        <p className="mt-2 text-sm text-stone-600">
          This area is for general admins. Your role: {user.adminRole ?? user.group}.
        </p>
      </main>
    );
  }
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">Admin · General</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Manage StudioLog</h1>
      <div className="mt-6 grid gap-4">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow hover:border-orange-400">
            <h2 className="font-extrabold">{l.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{l.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
