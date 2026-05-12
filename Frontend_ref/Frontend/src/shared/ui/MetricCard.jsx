export function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-stone-500">{detail}</p> : null}
    </div>
  )
}
