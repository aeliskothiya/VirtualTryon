export function FieldLabel({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-600">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function InputShell({ children }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus-within:border-[#c65d2c] focus-within:ring-4 focus-within:ring-[#c65d2c]/10">
      {children}
    </div>
  )
}
