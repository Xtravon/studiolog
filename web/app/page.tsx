import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center px-6 py-16">
      <main className="w-full max-w-2xl rounded-3xl border-2 border-white bg-white/80 p-8 shadow-xl sm:p-12">
        <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
          StudioLog · Phase 0
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Logistics booking, <span className="text-orange-600">one place</span>
          <span className="text-violet-700">.</span>
        </h1>
        <p className="mt-3 max-w-xl text-stone-600">
          Choose a service, describe your goods, consult a sales
          representative, approve the plan and price, pay, and track delivery —
          handled by{" "}
          <strong className="text-stone-900">LAS Transport Limited</strong>.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-3 text-center font-extrabold text-white shadow"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-xl border-2 border-violet-600 bg-white px-5 py-3 text-center font-extrabold text-violet-950"
          >
            Sign in
          </Link>
        </div>
        <dl className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          {[
            ["1", "Book a consultation"],
            ["2", "Approve plan & pay"],
            ["3", "Track to delivery"],
          ].map(([n, t]) => (
            <div
              key={n}
              className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3"
            >
              <dt className="font-extrabold text-orange-700">Step {n}</dt>
              <dd className="font-semibold">{t}</dd>
            </div>
          ))}
        </dl>
      </main>
    </div>
  );
}
