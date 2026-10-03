"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 font-normal outline-none focus:border-violet-600 w-full";

interface Props {
  shipmentId: string;
  services: { id: string; name: string }[];
  companies: { id: string; name: string; isPrimary: boolean }[];
  defaults: { serviceId: string; companyId: string; distanceKm: string };
}

export function PlanBuilder({ shipmentId, services, companies, defaults }: Props) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(defaults.serviceId);
  const [companyId, setCompanyId] = useState(defaults.companyId);
  const [distanceKm, setDistanceKm] = useState(defaults.distanceKm);
  const [handlingFee, setHandlingFee] = useState("0");
  const [timingEstimate, setTimingEstimate] = useState("");
  const [conditions, setConditions] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/shipments/${shipmentId}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: serviceId || null,
        companyId: companyId || null,
        distanceKm: distanceKm.trim() === "" ? null : Number(distanceKm),
        handlingFee: Number(handlingFee) || 0,
        timingEstimate,
        conditions,
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(json.error ?? "Could not create plan");
      return;
    }
    setMsg(`Plan v${json.version} created.`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-2xl border-2 border-violet-300 bg-violet-50 p-5">
      <h3 className="font-extrabold">Build new plan version (sales desk)</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">Service
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputCls}>
            <option value="">—</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Company
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={inputCls}>
            <option value="">—</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.isPrimary ? " ★" : ""}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Distance (km)
          <input inputMode="decimal" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} placeholder="Confirmed distance" className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold">Handling fee
          <input inputMode="decimal" value={handlingFee} onChange={(e) => setHandlingFee(e.target.value)} className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold sm:col-span-2">Expected timing
          <input value={timingEstimate} onChange={(e) => setTimingEstimate(e.target.value)} placeholder="e.g. Pickup Tue, delivery Fri" className={inputCls} />
        </label>
        <label className="grid gap-1 text-sm font-semibold sm:col-span-2">Conditions
          <textarea value={conditions} onChange={(e) => setConditions(e.target.value)} rows={2} className={inputCls} />
        </label>
      </div>
      {msg && <p className="mt-2 text-sm font-bold text-green-800">{msg}</p>}
      <button disabled={busy} className="mt-3 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-extrabold text-white shadow disabled:opacity-50">
        {busy ? "Creating…" : "Create plan version"}
      </button>
    </form>
  );
}
