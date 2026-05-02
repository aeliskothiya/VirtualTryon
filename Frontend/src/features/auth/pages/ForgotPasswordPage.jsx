import { useEffect, useRef, useState } from 'react'
import { resetPassword, sendPasswordResetOTP, verifyPasswordResetOTP } from '../../../shared/api/client'
import { FieldLabel } from '../../../shared/ui/Field'

const otpLength = 6
const passwordMinLength = 6

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0)
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0')
  const seconds = String(safeSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function normalizeError(error, fallbackMessage) {
  const detail = error?.payload?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (detail?.message) {
    return detail.message
  }

  return error?.message || fallbackMessage
}

export function ForgotPasswordPage({ onBackToLogin }) {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(Array.from({ length: otpLength }, () => ''))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [expiresIn, setExpiresIn] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const inputRefs = useRef([])
  const resendRef = useRef(null)

  useEffect(() => {
    if (step !== 'otp' || expiresIn <= 0) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setExpiresIn((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [step, expiresIn])

  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus()
    }
  }, [step])

  function handleOtpChange(index, value) {
    if (!/^[0-9]?$/.test(value)) {
      return
    }

    setError('')
    setOtpDigits((current) => {
      const next = [...current]
      next[index] = value
      return next
    })

    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpPaste(event) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpLength)

    if (!pasted) {
      return
    }

    event.preventDefault()
    setError('')
    setOtpDigits(Array.from({ length: otpLength }, (_, index) => pasted[index] || ''))
    inputRefs.current[Math.min(pasted.length, otpLength) - 1]?.focus()
  }

  async function handleSendOtp(event) {
    event.preventDefault()

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await sendPasswordResetOTP({ email: email.trim() })
      setStep('otp')
      setOtpDigits(Array.from({ length: otpLength }, () => ''))
      setExpiresIn(Number(response?.expires_in) || 0)
      resendRef.current = response?.expires_in ?? 0
    } catch (caughtError) {
      setError(normalizeError(caughtError, 'Failed to send OTP'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault()

    const otpCode = otpDigits.join('')

    if (otpCode.length !== otpLength) {
      setError('Enter the 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await verifyPasswordResetOTP({ email: email.trim(), otp_code: otpCode })
      setResetToken(response?.reset_token || '')
      setStep('password')
    } catch (caughtError) {
      setError(normalizeError(caughtError, 'Failed to verify OTP'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault()

    if (newPassword.length < passwordMinLength) {
      setError(`Password must be at least ${passwordMinLength} characters`)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      setSuccess('Password updated successfully. Redirecting to sign in...')
      window.setTimeout(() => {
        onBackToLogin?.()
      }, 1200)
    } catch (caughtError) {
      setError(normalizeError(caughtError, 'Failed to reset password'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOtp() {
    if (expiresIn > 0) {
      return
    }

    await handleSendOtp({ preventDefault() {} })
  }

  const isOtpComplete = otpDigits.every(Boolean)

  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8d401d]">
            Account recovery
          </p>
          <h3 className="mt-1 font-serif text-2xl tracking-tight text-stone-950">Forgot password</h3>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
        >
          Back to sign in
        </button>
      </div>

      {step === 'email' ? (
        <form className="grid gap-4" onSubmit={handleSendOtp}>
          <p className="text-sm leading-6 text-stone-500">
            Enter your email address. We will send a one-time code to verify your account before you choose a new
            password.
          </p>

          <FieldLabel label="Email address">
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              placeholder="you@example.com"
            />
          </FieldLabel>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form className="grid gap-4" onSubmit={handleVerifyOtp}>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Code sent to <span className="font-medium text-stone-900">{email}</span>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium text-stone-700">Enter OTP</label>
            <div className="flex flex-wrap gap-2" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value.replace(/\D/g, ''))}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
                      inputRefs.current[index - 1]?.focus()
                    }
                  }}
                  className="h-12 w-12 rounded-2xl border border-stone-200 bg-white text-center text-lg font-semibold text-stone-900 outline-none transition focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm">
            <div className="text-stone-600">
              {expiresIn > 0 ? (
                <span>
                  OTP expires in <span className="font-semibold text-stone-900">{formatCountdown(expiresIn)}</span>
                </span>
              ) : (
                <span>OTP expired or ready to resend.</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={expiresIn > 0 || loading}
              className="text-sm font-semibold text-[#c65d2c] transition disabled:cursor-not-allowed disabled:text-stone-400"
            >
              Resend OTP
            </button>
          </div>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={loading || !isOtpComplete}
            className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying OTP...' : 'Verify OTP'}
          </button>
        </form>
      ) : null}

      {step === 'password' ? (
        <form className="grid gap-4" onSubmit={handleResetPassword}>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Email verified for <span className="font-medium text-stone-900">{email}</span>. Set your new password
            below.
          </div>

          <FieldLabel label="New password">
            <input
              required
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={passwordMinLength}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              placeholder="At least 6 characters"
            />
          </FieldLabel>

          <FieldLabel label="Confirm password">
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={passwordMinLength}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              placeholder="Re-enter your new password"
            />
          </FieldLabel>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-6 text-stone-500">
            Password rules: minimum 6 characters and both password fields must match.
          </div>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Updating password...' : 'Update password'}
          </button>
        </form>
      ) : null}
    </div>
  )
}
