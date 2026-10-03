"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayForm({ planId }: { planId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay(simulate: "success" | "fail") {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, simulate }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(json.error ?? "Payment failed. Retry or contact support.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-white p-5 shadow">
      <p className="text-sm font-bold text-violet-900">
        Test mode — no real charge. Connect Paystack/Flutterwave/Stripe keys to go live.
      </p>
      {msg && (
        <p role="alert" className="mt-2 text-sm font-bold text-red-700">{msg}</p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => pay("success")}
          disabled={busy}
          className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-3 font-extrabold text-white shadow disabled:opacity-50"
        >
          {busy ? "Processing…" : "Pay now (test)"}
        </button>
        <button
          onClick={() => pay("fail")}
          disabled={busy}
          className="rounded-xl border-2 border-stone-300 bg-white px-4 py-3 text-sm font-extrabold text-stone-600 disabled:opacity-50"
        >
          Simulate decline
        </button>
      </div>
    </div>
  );
}
