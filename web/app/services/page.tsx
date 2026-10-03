import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LasNotice } from "@/components/las-notice";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Step 1 · Choose a service
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
        Logistics services
      </h1>
      <div className="mt-4">
        <LasNotice />
      </div>
      <div className="mt-6 grid gap-4">
        {services.map((s) => (
          <article
            key={s.id}
            className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow"
          >
            <h2 className="text-lg font-extrabold">{s.name}</h2>
            <p className="mt-1 text-sm text-stone-600">{s.description}</p>
            {s.includes && (
              <ul className="mt-2 list-disc pl-5 text-sm text-stone-700">
                {s.includes.split("\n").map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
            <Link
              href={`/shipments/new?service=${s.id}`}
              className="mt-4 inline-block rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-extrabold text-white shadow"
            >
              Continue with {s.name}
            </Link>
          </article>
        ))}
        {services.length === 0 && (
          <p className="text-sm text-stone-600">
            No services available yet. Please check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
