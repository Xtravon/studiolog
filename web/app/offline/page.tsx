import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
        Offline
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
        You&apos;re offline
      </h1>
      <p className="mt-2 text-sm text-stone-600">
        StudioLog needs a connection for bookings, payments, and tracking.
        Reconnect and try again.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-3 font-extrabold text-white shadow"
      >
        Retry
      </Link>
    </main>
  );
}
