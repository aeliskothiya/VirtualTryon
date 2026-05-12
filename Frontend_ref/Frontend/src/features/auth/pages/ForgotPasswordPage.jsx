import { useEffect, useRef, useState } from 'react'
import { resetPassword, sendPasswordResetOTP, verifyPasswordResetOTP } from '../../../shared/api/client'
import { useToast } from '../../../shared/components/ToastProvider'
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
  const { addToast } = useToast()
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
      addToast('Email is required to send a password reset code.', 'error')
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
    } catch (caughtError) {
      const message = normalizeError(caughtError, 'Failed to send OTP')
      setError(message)
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault()

    const otpCode = otpDigits.join('')

    if (otpCode.length !== otpLength) {
      setError('Enter the 6-digit OTP')
      addToast('Enter the 6-digit OTP.', 'error')
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
      const message = normalizeError(caughtError, 'Failed to verify OTP')
      setError(message)
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault()

    if (newPassword.length < passwordMinLength) {
      const message = `Password must be at least ${passwordMinLength} characters`
      setError(message)
      addToast(message, 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      addToast('Passwords do not match.', 'error')
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
      addToast('Password updated successfully. Redirecting to sign in...', 'success')
      window.setTimeout(() => {
        onBackToLogin?.()
      }, 1200)
    } catch (caughtError) {
      const message = normalizeError(caughtError, 'Failed to reset password')
      setError(message)
      addToast(message, 'error')
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
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8d401d]">Account recovery</p>
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
            Enter your email address. We will send a one-time code to verify your account before you choose a new password.
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

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Sending code...' : 'Send verification code'}
          </button>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form className="grid gap-4" onSubmit={handleVerifyOtp}>
          <p className="text-sm leading-6 text-stone-500">
            Enter the 6-digit code sent to <span className="font-semibold text-stone-900">{email}</span>
          </p>

          <div className="flex gap-2" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element
                }}
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value.replace(/\D/g, ''))}
                className="h-12 w-12 rounded-2xl border border-stone-200 bg-white text-center text-lg font-semibold text-stone-900 outline-none transition focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !isOtpComplete}
            className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify code'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading || expiresIn > 0}
              className="text-sm font-semibold text-[#c65d2c] transition hover:text-[#b65126] disabled:text-stone-400"
            >
              Resend code
            </button>
            {expiresIn > 0 ? <div className="mt-2 text-xs text-stone-500">Available in {formatCountdown(expiresIn)}</div> : null}
          </div>
        </form>
      ) : null}

      {step === 'password' ? (
        <form className="grid gap-4" onSubmit={handleResetPassword}>
          <p className="text-sm leading-6 text-stone-500">
            Create a new password for <span className="font-semibold text-stone-900">{email}</span>
          </p>

          <FieldLabel label="New password">
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              placeholder="New password"
            />
          </FieldLabel>

          <FieldLabel label="Confirm password">
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              placeholder="Confirm password"
            />
          </FieldLabel>

          <button
            type="submit"
            disabled={loading || !resetToken}
            className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Set new password'}
          </button>
        </form>
      ) : null}

    </div>
  )
}
