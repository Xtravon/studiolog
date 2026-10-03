"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PlanActions({ planId, shipmentId }: { planId: string; shipmentId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function post(path: string, body: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Action failed");
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() =>
            post(`/api/plans/${planId}/approve`, {})
              .then(() => router.push(`/shipments/${shipmentId}/pay`))
              .catch((e) => setMsg(e instanceof Error ? e.message : "Failed"))
          }
          className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-extrabold text-white shadow"
        >
          Approve plan & continue to payment
        </button>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-xl border-2 border-violet-600 bg-white px-4 py-2.5 text-sm font-extrabold text-violet-950"
        >
          Request correction
        </button>
      </div>
      {msg && <p className="text-sm font-bold text-red-700">{msg}</p>}
      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            post(`/api/plans/${planId}/correction`, { message }).catch((err) =>
              setMsg(err instanceof Error ? err.message : "Failed"),
            );
          }}
          className="flex flex-col gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 p-3"
        >
          <label className="grid gap-1 text-sm font-semibold">What should change?
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="rounded-xl border-2 border-amber-200 bg-white px-3 py-2 font-normal outline-none focus:border-violet-600" />
          </label>
          <button className="w-fit rounded-xl border-2 border-violet-600 bg-white px-4 py-2 text-sm font-extrabold text-violet-950">
            Send correction request
          </button>
        </form>
      )}
    </div>
  );
}
