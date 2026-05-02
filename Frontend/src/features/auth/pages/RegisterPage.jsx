import { useState } from 'react'
import { useAppContext } from '../../../app/AppContext'
import { FieldLabel } from '../../../shared/ui/Field'
import { sendOTP } from '../../../shared/api/client'
import OTPModal from '../components/OTPModal'

const registerDefaults = {
  name: '',
  email: '',
  password: '',
  confirm_password: '',
}

export function RegisterPage() {
  const { authState, register } = useAppContext()
  const [form, setForm] = useState(registerDefaults)
  const [emailVerified, setEmailVerified] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpModalExpires, setOtpModalExpires] = useState(null)
  const [otpModalExpiresIso, setOtpModalExpiresIso] = useState(null)

  async function handleSendOTP() {
    if (!form.email) {
      setOtpError('Please enter an email')
      return
    }

    setOtpLoading(true)
    setOtpError('')

    try {
      const resp = await sendOTP({ email: form.email })
      setShowOTPModal(true)
      // pass expiry info to modal via state
      setOtpLoading(false)
      setOtpError("")
      // attach expires info and ISO expiry to modal
      setOtpModalExpires(resp?.expires_in ?? null)
      setOtpModalExpiresIso(resp?.expires_at ?? null)
    } catch (err) {
      setOtpError(err.message || 'Failed to send OTP')
      setOtpLoading(false)
    }
  }

  function handleVerifySuccess() {
    setEmailVerified(true)
    setShowOTPModal(false)
    setOtpError('')
  }

  function handleEmailChange(newEmail) {
    setForm((current) => ({ ...current, email: newEmail }))
    setEmailVerified(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!emailVerified) {
      setOtpError('Please verify your email first')
      return
    }

    await register(form)
  }

  return (
    <>
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
          <div className="flex gap-2">
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => handleEmailChange(event.target.value)}
              disabled={emailVerified}
              className="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10 disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed"
            />
            {emailVerified ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-semibold text-sm whitespace-nowrap border border-emerald-200">
                <span>✓</span> Verified
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={otpLoading || !form.email}
                className="px-4 py-3 bg-[#c65d2c] hover:bg-[#b84d1c] disabled:bg-stone-300 text-white font-semibold rounded-2xl transition-colors whitespace-nowrap"
              >
                {otpLoading ? 'Sending...' : 'Verify'}
              </button>
            )}
          </div>
          {otpError && (
            <p className="text-rose-600 text-xs mt-2 flex items-center gap-1">
              <span>⚠</span> {otpError}
            </p>
          )}
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
          className="mt-2 rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b84d1c] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={authState.loading || !emailVerified}
        >
          {authState.loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {showOTPModal && (
        <OTPModal
          email={form.email}
          onVerifySuccess={handleVerifySuccess}
          onClose={() => setShowOTPModal(false)}
          expiresIn={otpModalExpires}
          expiresAt={otpModalExpiresIso}
        />
      )}
    </>
  )
}
