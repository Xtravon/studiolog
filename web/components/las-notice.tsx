export function LasNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-100 to-yellow-100 font-bold text-amber-900 ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"}`}
    >
      ★ Goods are handled by <span className="font-extrabold">LAS Transport Limited</span>
      {!compact && (
        <span className="mt-0.5 block text-xs font-semibold text-amber-800">
          LAS is our primary logistics company and handles every shipment.
        </span>
      )}
    </div>
  );
}
