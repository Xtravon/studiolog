import { MILESTONES, milestoneIndex } from "@/lib/tracking";

interface Event {
  id: string;
  milestone: string;
  message: string;
  actionRequired: boolean;
  createdAt: Date;
}

export function TrackingTimeline({ status, events }: { status: string; events: Event[] }) {
  if (status === "draft") return null;
  if (status === "cancelled") {
    return (
      <div className="mt-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4">
        <p className="font-extrabold text-red-800">Shipment cancelled</p>
        {events.map((e) => (
          <p key={e.id} className="mt-1 text-sm text-red-700">{e.message}</p>
        ))}
      </div>
    );
  }
  const current = milestoneIndex(status);
  const byMilestone = new Map(events.map((e) => [e.milestone, e]));
  return (
    <ol className="mt-3 flex flex-col gap-0">
      {MILESTONES.map((m, i) => {
        const state = i < current ? "done" : i === current ? "now" : "todo";
        const event = byMilestone.get(m.key);
        return (
          <li key={m.key} className="flex gap-3 border-l-[3px] border-amber-200 py-2 pl-4 last:border-transparent">
            <span
              aria-hidden
              className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] ${
                state === "done"
                  ? "border-violet-700 bg-violet-500"
                  : state === "now"
                    ? "border-orange-600 bg-orange-400"
                    : "border-stone-300 bg-white"
              }`}
            />
            <div>
              <p className={`text-sm font-extrabold ${state === "todo" ? "text-stone-400" : ""}`}>
                {m.label}
              </p>
              {state !== "todo" && (
                <p className="text-sm text-stone-600">{event?.message ?? m.message}</p>
              )}
              {event?.actionRequired && (
                <p className="mt-0.5 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-800">
                  Action needed from you
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
