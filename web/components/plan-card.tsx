interface PlanView {
  id: string;
  version: number;
  status: string;
  serviceName: string;
  companyName: string;
  goodsDesc: string;
  quantity: string;
  weightKg: number | null;
  dimensions: string;
  handlingNotes: string;
  pickupAddr: string;
  deliveryAddr: string;
  pickupTimePref: string;
  handlerStatement: string;
  distanceKm: number;
  transportCharge: number;
  handlingFee: number;
  totalPrice: number;
  currency: string;
  timingEstimate: string;
  conditions: string;
  correctionNote: string;
  photos?: unknown;
}

export function fmt(amount: number, currency: string): string {
  const symbol = currency === "NGN" ? "₦" : `${currency} `;
  return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function PlanCard({ plan }: { plan: PlanView }) {
  return (
    <article className="rounded-2xl border-2 border-amber-400 bg-white p-5 shadow">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-extrabold">Shipment plan · v{plan.version}</h3>
        <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-extrabold text-violet-950">
          {plan.status.replace("_", " ").toUpperCase()}
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="font-bold text-stone-500">Service</dt><dd>{plan.serviceName || "—"}</dd></div>
        <div><dt className="font-bold text-stone-500">Company</dt><dd>{plan.companyName || "—"}</dd></div>
        <div className="sm:col-span-2"><dt className="font-bold text-stone-500">Handler</dt><dd className="font-bold text-amber-800">★ {plan.handlerStatement}</dd></div>
        <div className="sm:col-span-2"><dt className="font-bold text-stone-500">Goods</dt><dd>{plan.goodsDesc || "—"}{plan.quantity ? ` · ${plan.quantity}` : ""}{plan.weightKg ? ` · ${plan.weightKg} kg` : ""}{plan.dimensions ? ` · ${plan.dimensions}` : ""}</dd></div>
        {plan.handlingNotes && <div className="sm:col-span-2"><dt className="font-bold text-stone-500">Handling</dt><dd>{plan.handlingNotes}</dd></div>}
        <div><dt className="font-bold text-stone-500">Pickup</dt><dd>{plan.pickupAddr || "—"}</dd></div>
        <div><dt className="font-bold text-stone-500">Delivery</dt><dd>{plan.deliveryAddr || "—"}</dd></div>
        <div><dt className="font-bold text-stone-500">Distance</dt><dd>{plan.distanceKm} km</dd></div>
        <div><dt className="font-bold text-stone-500">Timing</dt><dd>{plan.timingEstimate || "—"}</dd></div>
      </dl>
      <table className="mt-3 w-full text-sm">
        <tbody>
          <tr><td className="py-1 text-stone-600">Transport charge</td><td className="py-1 text-right font-bold">{fmt(plan.transportCharge, plan.currency)}</td></tr>
          <tr><td className="py-1 text-stone-600">Handling fee</td><td className="py-1 text-right font-bold">{fmt(plan.handlingFee, plan.currency)}</td></tr>
          <tr className="border-t-2 border-amber-300"><td className="py-1 font-extrabold">Total</td><td className="py-1 text-right font-extrabold text-orange-700">{fmt(plan.totalPrice, plan.currency)}</td></tr>
        </tbody>
      </table>
      {plan.conditions && <p className="mt-2 text-xs text-stone-600">Conditions: {plan.conditions}</p>}
      {plan.correctionNote && <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-800">Customer asked: {plan.correctionNote}</p>}
    </article>
  );
}
