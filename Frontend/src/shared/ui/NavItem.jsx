export function NavItem({ active, label, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-3 text-left transition ${
        active
          ? 'border border-[#c65d2c]/20 bg-[#c65d2c] text-white shadow-sm'
          : 'border border-white/10 bg-white/5 text-stone-200 hover:bg-white/10'
      }`}
    >
      <div className="text-[0.7rem] uppercase tracking-[0.22em] opacity-70">{label}</div>
      <div className="mt-1 text-sm font-medium">{title}</div>
    </button>
  )
}
