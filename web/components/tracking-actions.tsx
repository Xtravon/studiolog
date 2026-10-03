"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { allowedNext } from "@/lib/tracking";

const inputCls =
  "rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 font-normal outline-none focus:border-violet-600";

export function TrackingActions({ shipmentId, status }: { shipmentId: string; status: string }) {
  const router = useRouter();
  const next = allowedNext(status);
  const [milestone, setMilestone] = useState(next[0] ?? "");
  const [message, setMessage] = useState("");
  const [actionRequired, setActionRequired] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (next.length === 0) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch(`/api/shipments/${shipmentId}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestone, message, actionRequired }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg(json.error ?? "Update failed");
      return;
    }
    setMessage("");
    setActionRequired(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-2xl border-2 border-violet-300 bg-violet-50 p-4">
      <h3 className="text-sm font-extrabold">Post tracking update (operations)</h3>
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <select value={milestone} onChange={(e) => setMilestone(e.target.value)} className={inputCls}>
            {next.map((n) => (
              <option key={n} value={n}>{n.replace("_", " ")}</option>
            ))}
          </select>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (blank = default plain-language text)"
            className={`${inputCls} min-w-52 flex-1`}
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={actionRequired} onChange={(e) => setActionRequired(e.target.checked)} />
          Customer action required
        </label>
        {msg && <p className="text-sm font-bold text-red-700">{msg}</p>}
        <button className="w-fit rounded-xl bg-violet-700 px-4 py-2 text-sm font-extrabold text-white shadow">
          Post update
        </button>
      </div>
    </form>
  );
}
