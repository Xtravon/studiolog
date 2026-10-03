"use client";
import { useState } from "react";
import { LasNotice } from "@/components/las-notice";
import { MAX_PHOTOS } from "@/lib/shipments";

export interface ShipmentFormData {
  serviceId: string;
  companyId: string;
  goodsDesc: string;
  quantity: string;
  weightKg: string;
  dimensions: string;
  handlingNotes: string;
  pickupAddr: string;
  deliveryAddr: string;
  pickupTimePref: string;
  photos: string[];
}

interface Props {
  services: { id: string; name: string }[];
  companies: { id: string; name: string; isPrimary: boolean }[];
  initial: ShipmentFormData;
  submitLabel: string;
  onSubmit: (data: Omit<ShipmentFormData, "weightKg"> & { weightKg: number | null }) => Promise<void>;
}

const inputCls =
  "rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 font-normal outline-none focus:border-violet-600 w-full";

export function ShipmentForm({ services, companies, initial, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof ShipmentFormData>(key: K, value: ShipmentFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadPhoto(file: File) {
    if (form.photos.length >= MAX_PHOTOS) {
      setError(`At most ${MAX_PHOTOS} photos per shipment`);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("photo", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      set("photos", [...form.photos, json.key as string]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const weight = form.weightKg.trim() === "" ? null : Number(form.weightKg);
      if (weight !== null && (!Number.isFinite(weight) || weight <= 0)) {
        throw new Error("Weight must be a positive number, or left blank");
      }
      await onSubmit({ ...form, weightKg: weight });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
      <section className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow">
        <h2 className="font-extrabold">Service & company</h2>
        <div className="mt-3 grid gap-4">
          <label className="grid gap-1 text-sm font-semibold">
            Service
            <select value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)} className={inputCls}>
              <option value="">Choose later with the sales rep…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Logistics company
            <select value={form.companyId} onChange={(e) => set("companyId", e.target.value)} className={inputCls}>
              <option value="">Choose later with the sales rep…</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.isPrimary ? " ★ (primary — handles goods)" : ""}
                </option>
              ))}
            </select>
          </label>
          <LasNotice compact />
        </div>
      </section>

      <section className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow">
        <h2 className="font-extrabold">Goods</h2>
        <div className="mt-3 grid gap-4">
          <label className="grid gap-1 text-sm font-semibold">
            Description of goods
            <textarea rows={3} value={form.goodsDesc} onChange={(e) => set("goodsDesc", e.target.value)} placeholder="e.g. 40 cartons of studio equipment" className={inputCls} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1 text-sm font-semibold">
              Quantity
              <input value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="e.g. 40 cartons" className={inputCls} />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Weight (kg)
              <input inputMode="decimal" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} placeholder="e.g. 850" className={inputCls} />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Dimensions
              <input value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="e.g. 120×80×60 cm" className={inputCls} />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-semibold">
            Special handling needs
            <textarea rows={2} value={form.handlingNotes} onChange={(e) => set("handlingNotes", e.target.value)} placeholder="Fragile, keep dry, needs a forklift…" className={inputCls} />
          </label>
          <div className="grid gap-1 text-sm font-semibold">
            Photos (up to {MAX_PHOTOS})
            <div className="flex flex-wrap gap-2">
              {form.photos.map((key) => (
                <div key={key} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/uploads/${key}`} alt="Goods photo" className="h-20 w-20 rounded-xl border-2 border-amber-200 object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => set("photos", form.photos.filter((p) => p !== key))}
                    className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs font-extrabold text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <label className="mt-1 inline-flex w-fit cursor-pointer rounded-xl border-2 border-violet-600 bg-white px-4 py-2 text-violet-950">
              {uploading ? "Uploading…" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void uploadPhoto(f);
                }}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow">
        <h2 className="font-extrabold">Pickup & delivery</h2>
        <div className="mt-3 grid gap-4">
          <label className="grid gap-1 text-sm font-semibold">
            Pickup location
            <input value={form.pickupAddr} onChange={(e) => set("pickupAddr", e.target.value)} placeholder="Street, area, city" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Delivery location
            <input value={form.deliveryAddr} onChange={(e) => set("deliveryAddr", e.target.value)} placeholder="Street, area, city" className={inputCls} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Preferred pickup / delivery timing
            <input value={form.pickupTimePref} onChange={(e) => set("pickupTimePref", e.target.value)} placeholder="e.g. Weekday mornings" className={inputCls} />
          </label>
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>
      )}
      <button
        type="submit"
        disabled={busy || uploading}
        className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-3 font-extrabold text-white shadow disabled:opacity-50"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
