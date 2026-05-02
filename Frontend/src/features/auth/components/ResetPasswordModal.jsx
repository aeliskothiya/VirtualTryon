import { useState, useEffect, useRef } from "react";
import {
  resetPassword,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
} from '../../../shared/api/client'

export default function ResetPasswordModal({ email: initialEmail = "", onClose }) {
  const [step, setStep] = useState(1); // 1: send email, 2: verify otp, 3: set new password
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((v) => Math.max(0, v - 1)), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const sendReset = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await sendPasswordResetOTP({ email });
      setStep(2);
      setResendCooldown(resp?.expires_in ?? 60);
    } catch (e) {
      setError(e.message || 'Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return }
    setLoading(true); setError("");
    try {
      const resp = await verifyPasswordResetOTP({ email, otp_code: otp });
      setResetToken(resp.reset_token);
      setStep(3);
    } catch (e) { setError(e.message || 'Failed to verify OTP') } finally { setLoading(false) }
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) { setError('Password too short'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true); setError("");
    try {
      await resetPassword({ reset_token: resetToken, new_password: newPassword, confirm_password: confirmPassword });
      setSuccess(true);
      setTimeout(() => onClose && onClose(), 1500);
    } catch (e) { setError(e.message || 'Failed to reset password') } finally { setLoading(false) }
  };

  const handleDigitChange = (i, v) => {
    if (!/^[0-9]?$/.test(v)) return;
    const d = [...digits]; d[i] = v; setDigits(d);
    if (v && i < 5) inputsRef.current[i+1]?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-96">
        <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
        {step === 1 && (
          <>
            <p className="text-sm mb-4">Enter the email for your account to receive an OTP.</p>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full mb-4 p-2 border" />
            {error && <p className="text-rose-600">{error}</p>}
            <button onClick={sendReset} disabled={loading||!email} className="mt-3 w-full bg-[#c65d2c] text-white py-2 rounded">Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm mb-3">Enter the 6-digit code sent to {email}</p>
            <div className="flex gap-2 mb-3">
              {digits.map((d,i)=> (
                <input key={i} ref={el=>inputsRef.current[i]=el} maxLength={1} value={d} onChange={e=>handleDigitChange(i,e.target.value.replace(/\D/g,''))} className="w-12 h-12 text-center border" />
              ))}
            </div>
            {error && <p className="text-rose-600">{error}</p>}
            <button onClick={verify} disabled={loading||digits.join('').length!==6} className="w-full bg-[#c65d2c] text-white py-2 rounded">Verify OTP</button>
            <div className="mt-3 text-center">
              <button onClick={sendReset} disabled={resendCooldown>0} className="text-sm text-[#c65d2c]">Resend Code</button>
              {resendCooldown>0 && <div className="text-xs text-stone-500">Available in {resendCooldown}s</div>}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm mb-3">Enter a new password for {email}</p>
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password" className="w-full mb-2 p-2 border" />
            <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full mb-2 p-2 border" />
            {error && <p className="text-rose-600">{error}</p>}
            <button onClick={resetPassword} disabled={loading||!resetToken} className="w-full bg-[#c65d2c] text-white py-2 rounded">Set New Password</button>
          </>
        )}

        {success && <div className="text-emerald-600 mt-3">Password updated successfully. Closing...</div>}

        <div className="mt-4">
          <button onClick={onClose} className="w-full border py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  )
}
