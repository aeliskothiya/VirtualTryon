export function Panel({ className = '', children }) {
  return (
    <article
      className={`rounded-[28px] border border-stone-200 bg-stone-50/90 p-6 shadow-soft backdrop-blur-xl ${className}`.trim()}
    >
      {children}
    </article>
  )
}
