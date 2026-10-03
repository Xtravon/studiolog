"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface C {
  id: string;
  mode: string;
  scheduledAt: string | null;
  meetingLink: string;
  note: string;
  status: string;
  callbackRequested: boolean;
  customerId: string;
  service: string;
  company: string;
  goods: string;
  route: string;
}

export function StaffConsultations({ initial }: { initial: C[] }) {
  const router = useRouter();
  const [link, setLink] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

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
    <div className="mt-6 grid gap-3">
      {msg && <p className="text-sm font-bold text-red-700">{msg}</p>}
      {initial.map((c) => (
        <div key={c.id} className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong>
              {c.service} · {c.mode === "video" ? "Video" : "Phone"} ·{" "}
              {c.callbackRequested && !c.scheduledAt
                ? "Callback requested"
                : c.scheduledAt
                  ? new Date(c.scheduledAt).toLocaleString()
                  : "—"}
            </strong>
            <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-extrabold text-violet-950">
              {c.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-600">
            Goods: {c.goods} · Route: {c.route} · Company: {c.company}
            {c.note ? ` · Note: “${c.note}”` : ""}
            {c.meetingLink ? ` · Link: ${c.meetingLink}` : ""}
          </p>
          {c.status === "booked" && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                value={link[c.id] ?? ""}
                onChange={(e) => setLink({ ...link, [c.id]: e.target.value })}
                placeholder="Meeting link or phone number"
                className="min-w-52 flex-1 rounded-lg border-2 border-amber-200 bg-amber-50 px-2 py-1 text-sm outline-none focus:border-violet-600"
              />
              <button
                onClick={() =>
                  act(c.id, { action: "link", meetingLink: link[c.id] ?? "" }).catch((e) =>
                    setMsg(e instanceof Error ? e.message : "Failed"),
                  )
                }
                className="rounded-lg border-2 border-violet-600 px-3 py-1 text-xs font-extrabold text-violet-950"
              >
                Save link
              </button>
              <button
                onClick={() => act(c.id, { action: "done" }).then(() => router.refresh()).catch((e) => setMsg(e instanceof Error ? e.message : "Failed"))}
                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-extrabold text-white"
              >
                Done
              </button>
              <button
                onClick={() => act(c.id, { action: "no_show" }).then(() => router.refresh()).catch((e) => setMsg(e instanceof Error ? e.message : "Failed"))}
                className="rounded-lg border-2 border-red-300 px-3 py-1 text-xs font-extrabold text-red-700"
              >
                No-show
              </button>
            </div>
          )}
        </div>
      ))}
      {initial.length === 0 && <p className="text-sm text-stone-600">No consultations yet.</p>}
    </div>
  );
}
