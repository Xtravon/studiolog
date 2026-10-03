"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
  contact: string | null;
  isPrimary: boolean;
  active: boolean;
}

const inputCls =
  "rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 font-normal outline-none focus:border-violet-600 w-full";

export function CompanyManager({ initial }: { initial: Company[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function call(method: string, body: unknown) {
    const res = await fetch("/api/admin/companies", {
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
            await call("POST", { name, contact });
            setName("");
            setContact("");
            setMsg("Company added as an additional option.");
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Failed");
          }
        }}
        className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow"
      >
        <h2 className="font-extrabold">Add company option</h2>
        <div className="mt-3 grid gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" required className={inputCls} />
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact (optional)" className={inputCls} />
          <button className="w-fit rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-extrabold text-white shadow">
            Add company
          </button>
        </div>
      </form>
      {msg && <p className="text-sm font-bold text-green-800">{msg}</p>}
      {initial.map((c) => (
        <div key={c.id} className={`rounded-2xl border-2 p-4 shadow ${c.isPrimary ? "border-amber-400 bg-amber-50" : "border-amber-200 bg-white"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong>
              {c.name}{" "}
              {c.isPrimary && <span className="text-xs font-extrabold text-amber-800">★ PRIMARY</span>}
            </strong>
            {!c.isPrimary && (
              <button
                onClick={() => call("PATCH", { id: c.id, active: !c.active }).catch(() => {})}
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${c.active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"}`}
              >
                {c.active ? "ACTIVE — hide" : "HIDDEN — show"}
              </button>
            )}
          </div>
          {c.contact && <p className="mt-1 text-sm text-stone-600">{c.contact}</p>}
        </div>
      ))}
    </div>
  );
}
