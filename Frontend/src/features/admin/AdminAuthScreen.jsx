import { useState } from 'react'
import { useAppContext } from '../../app/AppContext'
import { setRouteHash } from '../../shared/navigation'
import { FieldLabel } from '../../shared/ui/Field'

const loginDefaults = {
  email: '',
  password: '',
}

export function AdminAuthScreen() {
  const { authState, loginAdmin } = useAppContext()
  const [form, setForm] = useState(loginDefaults)

  async function handleSubmit(event) {
    event.preventDefault()
    await loginAdmin(form)
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-5xl gap-6 px-4 py-4 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 xl:px-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-stone-950 p-8 text-stone-50 shadow-soft lg:p-10">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-[#c65d2c]/20 blur-3xl" />
          <div className="absolute right-[-6rem] bottom-[-6rem] h-72 w-72 rounded-full bg-[#295a74]/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between gap-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#f7d0b8]">
                Admin workspace
              </span>
              <span className="rounded-full border border-[#c65d2c]/20 bg-[#c65d2c]/10 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#f7d0b8]">
                Secure access
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-serif text-5xl leading-[0.92] tracking-tight text-white md:text-6xl">
                Admin control room for FashionAI.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
                Sign in with an admin account to review system-wide analytics and manage the platform.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-sm backdrop-blur">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-400">Analytics</p>
              <p className="mt-2 font-medium text-stone-100">Users, try-ons, and recommendations</p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-sm backdrop-blur">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-400">Admin roles</p>
              <p className="mt-2 font-medium text-stone-100">Restricted to admin accounts only</p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-sm backdrop-blur">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-400">Overview</p>
              <p className="mt-2 font-medium text-stone-100">System-wide health at a glance</p>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-stone-200 bg-stone-50/90 p-5 shadow-soft backdrop-blur-xl md:p-6">
        <div className="space-y-2">
          <span className="inline-flex w-fit rounded-full bg-[#c65d2c]/10 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8d401d]">
            Admin sign in
          </span>
          <h2 className="font-serif text-3xl tracking-tight text-stone-950 md:text-4xl">Enter admin credentials</h2>
          <p className="max-w-xl text-sm leading-7 text-stone-500">
            This route is separate from the normal user login and only works for admin records stored in the admins collection.
          </p>
        </div>

        {authState.error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {authState.error}
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <FieldLabel label="Admin email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
            />
          </FieldLabel>

          <FieldLabel label="Password">
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
            />
          </FieldLabel>

          <button
            className="mt-2 rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={authState.loading}
          >
            {authState.loading ? 'Signing in...' : 'Open admin dashboard'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setRouteHash('auth', 'login')}
          className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Back to user sign in
        </button>
      </section>
    </main>
  )
}
