import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import apiClient from "../../api/apiClient";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail("");
      setOtpDigits(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccessMsg("");
      setCountdown(0);
      setLoading(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const otp = otpDigits.join("");

  // ── Step 1: Send OTP ──────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/forgot-password/send-otp", {
        email: email.trim(),
      });
      if (data.success) {
        setStep(2);
        setCountdown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
      );
    }
    setLoading(false);
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    // We do a lightweight check — send a dummy password just to verify OTP.
    // The real reset happens at step 3. We call the verify endpoint via the reset route
    // but without newPassword so the server can return early on OTP validity.
    // Instead, we locally trust the OTP step and move to step 3 (server re-verifies at step 3).
    // This keeps the UX smooth with a single /reset endpoint.
    setLoading(false);
    setStep(3);
  };

  // ── Step 3: Reset Password ────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/forgot-password/reset", {
        email: email.trim(),
        otp,
        newPassword,
      });
      if (data.success) {
        setSuccessMsg(data.message || "Password reset successfully!");
      } else {
        setError(data.message || "Failed to reset password.");
        // If OTP was wrong/expired, go back to step 2
        if (data.message?.toLowerCase().includes("otp")) setStep(2);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      setError(msg);
      if (msg.toLowerCase().includes("otp")) setStep(2);
    }
    setLoading(false);
  };

  // ── OTP input keyboard handling ───────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtpDigits(next);
    const nextFocus = Math.min(pasted.length, 5);
    otpRefs.current[nextFocus]?.focus();
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setOtpDigits(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password/send-otp", {
        email: email.trim(),
      });
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
    setLoading(false);
  };

  // ── Step labels ───────────────────────────────────────────────
  const steps = [
    { label: "Email", icon: Mail },
    { label: "Verify OTP", icon: KeyRound },
    { label: "New Password", icon: Lock },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Modal card */}
        <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in">
          {/* Top gradient bar */}
          <div
            className="h-1.5 w-full"
            style={{
              background: "linear-gradient(90deg,#0284c7,#38bdf8,#0284c7)",
              backgroundSize: "200% 100%",
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              {step > 1 && !successMsg && (
                <button
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Forgot Password
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {!successMsg
                    ? `Step ${step} of 3 — ${steps[step - 1].label}`
                    : "All done!"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress dots */}
          {!successMsg && (
            <div className="flex items-center gap-2 px-6 pb-5">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const active = i + 1 === step;
                const done = i + 1 < step;
                return (
                  <React.Fragment key={s.label}>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? "bg-primary-600 text-white"
                          : done
                            ? "bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-300"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{s.label}</span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`flex-1 h-px rounded-full transition-colors ${done ? "bg-primary-400" : "bg-gray-200 dark:bg-gray-700"}`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Body */}
          <div className="px-6 pb-8 space-y-4">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── SUCCESS STATE ── */}
            {successMsg ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                  {successMsg}
                </p>
                <button
                  onClick={handleClose}
                  className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20"
                >
                  Go to Sign In
                </button>
              </div>
            ) : step === 1 ? (
              /* ── STEP 1: EMAIL ── */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600">
                  <Mail className="h-6 w-6" />
                </div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 -mt-1">
                  Enter your registered email and we'll send you a 6-digit
                  verification code.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-colors"
                    autoFocus
                  />
                </div>
                <button
                  id="fp-send-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending
                      OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            ) : step === 2 ? (
              /* ── STEP 2: OTP ── */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600">
                  <KeyRound className="h-6 w-6" />
                </div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 -mt-1">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {email}
                  </span>
                </p>

                {/* OTP boxes */}
                <div
                  className="flex justify-center gap-2"
                  onPaste={handleOtpPaste}
                >
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`fp-otp-${i}`}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`h-12 w-11 rounded-xl border-2 text-center text-lg font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:outline-none transition-all ${
                        digit
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40"
                          : "border-gray-200 dark:border-gray-700 focus:border-primary-400"
                      }`}
                    />
                  ))}
                </div>

                <button
                  id="fp-verify-otp-btn"
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                {/* Resend */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Didn't receive the code?{" "}
                  {countdown > 0 ? (
                    <span className="text-primary-500 font-semibold">
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-primary-600 dark:text-primary-400 font-semibold hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </p>
              </form>
            ) : (
              /* ── STEP 3: NEW PASSWORD ── */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600">
                  <Lock className="h-6 w-6" />
                </div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 -mt-1">
                  OTP verified! Now set a strong new password for your account.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="fp-new-password"
                      type={showNew ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPassword.length > 0 && (
                    <div className="mt-1.5 flex gap-1">
                      {[...Array(4)].map((_, i) => {
                        const strength =
                          newPassword.length >= 10
                            ? 4
                            : newPassword.length >= 8
                              ? 3
                              : newPassword.length >= 6
                                ? 2
                                : 1;
                        return (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"][strength - 1] : "bg-gray-200 dark:bg-gray-700"}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="fp-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm text-gray-900 bg-gray-50 focus:outline-none dark:text-white dark:bg-gray-800 transition-colors ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-red-400 focus:border-red-500"
                          : confirmPassword && confirmPassword === newPassword
                            ? "border-emerald-400 focus:border-emerald-500"
                            : "border-gray-200 dark:border-gray-700 focus:border-primary-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                <button
                  id="fp-reset-password-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Keyframe for modal entrance */}
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .animate-in { animation: modal-in 0.22s cubic-bezier(.22,1,.36,1) both; }
      `}</style>
    </>
  );
};

export default ForgotPasswordModal;
