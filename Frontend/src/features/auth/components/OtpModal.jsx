import { useState, useEffect, useRef } from "react";
import { verifyOTP, sendOTP } from "../../../shared/api/client";

export default function OTPModal({ email, onVerifySuccess, onClose, expiresIn = null, expiresAt = null }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const inputsRef = useRef([]);

  // Initialize cooldown from backend-provided expiry (seconds) or ISO expiry
  useEffect(() => {
    if (typeof expiresIn === "number" && expiresIn > 0) {
      setResendCooldown(expiresIn);
      return
    }

    if (expiresAt) {
      try {
        const then = Date.parse(expiresAt)
        if (!isNaN(then)) {
          const secs = Math.max(0, Math.round((then - Date.now()) / 1000))
          if (secs > 0) setResendCooldown(secs)
        }
      } catch (e) {
        // ignore
      }
    }
  }, [expiresIn, expiresAt]);

  const formatTime = (s) => {
    if (s == null) return ''
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((v) => Math.max(0, v - 1)), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOTP({ email, otp_code: otp });

      setSuccess(true);
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        onVerifySuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");

    try {
      const resp = await sendOTP({ email });
      const expires = resp?.expires_in ?? 60;
      setResendCooldown(expires);
      setSuccess(false);
      setDigits(["", "", "", "", "", ""]);
      setError("");
      // focus first box
      inputsRef.current?.[0]?.focus();
    } catch (err) {
      // If backend returned structured detail in error, try to extract retry time
      const payload = err?.payload || null
      const detail = payload?.detail || err?.message
      if (payload && payload.detail && typeof payload.detail === 'object') {
        setError(payload.detail.message || JSON.stringify(payload.detail))
      } else {
        setError(typeof detail === "string" ? detail : (detail?.message || "Failed to resend OTP"))
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && digits.join("").length === 6) {
      handleVerify();
    }
  };

  const handleDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) {
      inputsRef.current?.[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (paste.length === 6) {
      const next = paste.split("").slice(0, 6);
      setDigits(next);
      // focus last
      setTimeout(() => inputsRef.current?.[5]?.focus(), 0);
    }
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-96">
        <h2 className="text-2xl font-bold mb-2 text-stone-900">Verify Email</h2>
        <p className="text-stone-600 text-sm mb-6">
          Enter the 6-digit code sent to <br />
          <span className="font-semibold text-stone-900">{email}</span>
        </p>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <p className="text-emerald-700 flex items-center gap-2 font-medium">
              <span className="text-xl">✓</span> Email verified successfully!
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value.replace(/\D/g, ""))}
                  onKeyPress={handleKeyPress}
                  className="w-12 h-12 text-center text-2xl font-mono border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#c65d2c]"
                  disabled={loading || success}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && (
              <p className="text-rose-600 text-sm mb-4 flex items-center gap-2">
                <span>⚠</span> {error}
              </p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || digits.join("").length !== 6 || success}
              className="w-full bg-[#c65d2c] hover:bg-[#b84d1c] disabled:bg-stone-300 text-white font-semibold py-3 rounded-lg transition-colors duration-200 mb-3"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="text-center">
              <p className="text-stone-600 text-xs mb-3">Didn't receive the code?</p>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-[#c65d2c] hover:text-[#b84d1c] disabled:text-stone-400 font-semibold text-sm transition-colors"
                >
                  {resendLoading ? "Resending..." : "Resend Code"}
                </button>
                {resendCooldown > 0 && (
                  <p className="text-stone-500 text-xs">Available in {formatTime(resendCooldown)}</p>
                )}
              </div>
            </div>
          </>
        )}

        {!success && (
          <button
            onClick={onClose}
            className="w-full text-stone-600 hover:text-stone-900 font-semibold py-2 rounded-lg transition-colors duration-200 mt-6 border border-stone-200"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
