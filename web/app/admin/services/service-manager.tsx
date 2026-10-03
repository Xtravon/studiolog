"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string;
  includes: string;
  active: boolean;
}

const inputCls =
  "rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 font-normal outline-none focus:border-violet-600 w-full";

export function ServiceManager({ initial }: { initial: Service[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function call(method: string, body: unknown) {
    const res = await fetch("/api/admin/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Request failed");
    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg(null);
          try {
            await call("POST", { name, description });
            setName("");
            setDescription("");
            setMsg("Service added.");
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Failed");
          }
        }}
        className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow"
      >
        <h2 className="font-extrabold">Add service</h2>
        <div className="mt-3 grid gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" required className={inputCls} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What it includes (one per line in Includes below)…" rows={2} className={inputCls} />
          <button className="w-fit rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-extrabold text-white shadow">
            Add service
          </button>
        </div>
      </form>
      {msg && <p className="text-sm font-bold text-green-800">{msg}</p>}
      {initial.map((s) => (
        <div key={s.id} className="rounded-2xl border-2 border-amber-200 bg-white p-4 shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong>{s.name}</strong>
            <button
              onClick={() => call("PATCH", { id: s.id, active: !s.active }).catch(() => {})}
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${s.active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"}`}
            >
              {s.active ? "ACTIVE — hide" : "HIDDEN — show"}
            </button>
          </div>
          <p className="mt-1 text-sm text-stone-600">{s.description || "No description"}</p>
        </div>
      ))}
    </div>
  );
}
