"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Draft {
  id: string;
  label: string;
}
interface Consultation {
  id: string;
  mode: string;
  scheduledAt: string | null;
  meetingLink: string;
  note: string;
  status: string;
  callbackRequested: boolean;
  shipmentLabel: string;
}

const inputCls =
  "rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 font-normal outline-none focus:border-violet-600 w-full";

function toLocal(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

export function ConsultationManager({ drafts, initial }: { drafts: Draft[]; initial: Consultation[] }) {
  const router = useRouter();
  const [shipmentId, setShipmentId] = useState(drafts[0]?.id ?? "");
  const [mode, setMode] = useState("phone");
  const [when, setWhen] = useState(() => toLocal(new Date(Date.now() + 86400000)));
  const [note, setNote] = useState("");
  const [callback, setCallback] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function post(body: unknown) {
    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Booking failed");
    router.refresh();
  }

  async function act(id: string, body: unknown) {
    const res = await fetch(`/api/consultations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Action failed");
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg(null);
          try {
            await post(
              callback
                ? { shipmentId, note, callbackRequested: true }
                : { shipmentId, mode, note, scheduledAt: new Date(when).toISOString() },
            );
            setMsg(callback ? "Callback requested. A sales rep will call you." : "Consultation booked.");
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Booking failed");
          }
        }}
        className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow"
      >
        <h2 className="font-extrabold">Book a consultation</h2>
        {drafts.length === 0 ? (
          <p className="mt-2 text-sm text-stone-600">Create a shipment draft first.</p>
        ) : (
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold">Shipment
              <select value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} className={inputCls}>
                {drafts.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">Mode
                <select value={mode} onChange={(e) => setMode(e.target.value)} className={inputCls} disabled={callback}>
                  <option value="phone">Phone call</option>
                  <option value="video">Video call</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold">Date & time
                <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} disabled={callback} />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold">What do you need help with?
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. confirm handling for fragile items" className={inputCls} />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={callback} onChange={(e) => setCallback(e.target.checked)} />
              No time works — request a callback instead
            </label>
            <button className="w-fit rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-extrabold text-white shadow">
              {callback ? "Request callback" : "Book consultation"}
            </button>
          </div>
        )}
      </form>
      {msg && <p className="text-sm font-bold text-green-800">{msg}</p>}

      <div className="grid gap-3">
        {initial.map((c) => (
          <div key={c.id} className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>
                {c.shipmentLabel} · {c.mode === "video" ? "Video" : "Phone"}
              </strong>
              <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-extrabold text-violet-950">
                {c.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-600">
              {c.callbackRequested && !c.scheduledAt
                ? "Callback requested — a sales rep will call you."
                : c.scheduledAt
                  ? new Date(c.scheduledAt).toLocaleString()
                  : ""}
              {c.meetingLink ? ` · Link: ${c.meetingLink}` : ""}
              {c.note ? ` · “${c.note}”` : ""}
            </p>
            {c.status === "booked" && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={async () => {
                    const v = prompt("New date & time (YYYY-MM-DDTHH:MM)", toLocal(new Date(Date.now() + 86400000)));
                    if (!v) return;
                    try {
                      await act(c.id, { action: "reschedule", scheduledAt: new Date(v).toISOString() });
                    } catch (err) {
                      setMsg(err instanceof Error ? err.message : "Failed");
                    }
                  }}
                  className="rounded-lg border-2 border-violet-600 px-3 py-1 text-xs font-extrabold text-violet-950"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => act(c.id, { action: "cancel" }).then(() => router.refresh()).catch((err) => setMsg(err instanceof Error ? err.message : "Failed"))}
                  className="rounded-lg border-2 border-red-300 px-3 py-1 text-xs font-extrabold text-red-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
        {initial.length === 0 && (
          <p className="text-sm text-stone-600">No consultations yet.</p>
        )}
      </div>
    </div>
  );
}
