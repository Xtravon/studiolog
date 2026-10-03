"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Issue {
  id: string;
  message: string;
  status: string;
}

export function IssueBox({
  shipmentId,
  initial,
  staff,
}: {
  shipmentId: string;
  initial: Issue[];
  staff: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="mt-3 rounded-2xl border-2 border-amber-200 bg-white p-4 shadow">
      <h3 className="text-sm font-extrabold">Report an issue / contact support</h3>
      {!staff && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg(null);
            const res = await fetch(`/api/shipments/${shipmentId}/issues`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message }),
            });
            const json = await res.json();
            if (!res.ok) {
              setMsg(json.error ?? "Could not send");
              return;
            }
            setMessage("");
            router.refresh();
          }}
          className="mt-2 flex gap-2"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the problem…"
            className="min-w-0 flex-1 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm outline-none focus:border-violet-600"
          />
          <button className="rounded-xl border-2 border-violet-600 bg-white px-3 py-2 text-sm font-extrabold text-violet-950">
            Send
          </button>
        </form>
      )}
      {msg && <p className="mt-1 text-sm font-bold text-red-700">{msg}</p>}
      <div className="mt-2 grid gap-2">
        {initial.map((i) => (
          <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 p-2 text-sm">
            <span>{i.message}</span>
            <span className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${i.status === "open" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {i.status.toUpperCase()}
              </span>
              {staff && i.status === "open" && (
                <button
                  onClick={async () => {
                    await fetch(`/api/issues/${i.id}`, { method: "PATCH" });
                    router.refresh();
                  }}
                  className="rounded-lg border border-green-600 px-2 py-0.5 text-xs font-extrabold text-green-800"
                >
                  Resolve
                </button>
              )}
            </span>
          </div>
        ))}
        {initial.length === 0 && <p className="text-sm text-stone-500">No issues reported.</p>}
      </div>
    </div>
  );
}
