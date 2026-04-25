import { useState } from 'react'
import { useAppContext } from '../../../app/AppContext'
import { FieldLabel } from '../../../shared/ui/Field'

const registerDefaults = {
  name: '',
  email: '',
  password: '',
  confirm_password: '',
}

export function RegisterPage() {
  const { authState, register } = useAppContext()
  const [form, setForm] = useState(registerDefaults)

  async function handleSubmit(event) {
    event.preventDefault()
    await register(form)
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <FieldLabel label="Name">
        <input
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
        />
      </FieldLabel>

      <FieldLabel label="Email">
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

      <FieldLabel label="Confirm password">
        <input
          required
          type="password"
          value={form.confirm_password}
          onChange={(event) =>
            setForm((current) => ({ ...current, confirm_password: event.target.value }))
          }
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
        />
      </FieldLabel>

      <button
        className="mt-2 rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={authState.loading}
      >
        {authState.loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
