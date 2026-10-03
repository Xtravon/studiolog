"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 font-normal outline-none focus:border-violet-600 w-full";

export function PricingForm({ initial }: {
  initial: { perKmRate: number; baseFee: number; minimumCharge: number; currency: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState({ ...initial, currency: initial.currency });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        perKmRate: Number(form.perKmRate),
        baseFee: Number(form.baseFee),
        minimumCharge: Number(form.minimumCharge),
        currency: form.currency.toUpperCase(),
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(json.error ?? "Save failed");
      return;
    }
    setMsg(`Pricing saved (${json.pricing.currency} ${json.pricing.perKmRate}/km). New quotes use it immediately.`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border-2 border-amber-200 bg-white p-5 shadow">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">Per-km rate
          <input inputMode="decimal" value={form.perKmRate} onChange={(e) => setForm({ ...form, perKmRate: Number(e.target.value) })} className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold">Base fee
          <input inputMode="decimal" value={form.baseFee} onChange={(e) => setForm({ ...form, baseFee: Number(e.target.value) })} className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold">Minimum charge
          <input inputMode="decimal" value={form.minimumCharge} onChange={(e) => setForm({ ...form, minimumCharge: Number(e.target.value) })} className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold">Currency (3 letters)
          <input value={form.currency} maxLength={3} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls} />
        </label>
      </div>
      {msg && <p className="mt-3 text-sm font-bold text-green-800">{msg}</p>}
      <button type="submit" disabled={busy} className="mt-4 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-3 font-extrabold text-white shadow disabled:opacity-50">
        {busy ? "Saving…" : "Save pricing"}
      </button>
    </form>
  );
}
