import React, { useState, useEffect, useRef } from "react";
import {
  X,
  KeyRound,
  Loader2,
  AlertCircle,
  Mail,
} from "lucide-react";
import apiClient from "../../api/apiClient";

const SignupVerifyModal = ({ isOpen, onClose, email, onVerified }) => {
  const [step, setStep] = useState(1);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);

  const otpRefs = useRef([]);
  const errorRef = useRef(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtpDigits(["", "", "", "", "", ""]);
      setError("");
      setCountdown(0);
      setLoading(false);
      setSending(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !email.trim()) {
      setError("Email address is required.");
      return;
    }
    setSending(true);
    try {
      const { data } = await apiClient.post("/auth/signup/send-otp", {
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
    setSending(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const currentOtp = otpDigits.join("");
    if (currentOtp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/signup/verify-otp", {
        email: email.trim(),
        otp: currentOtp,
      });
      if (data?.success) {
        onVerified && onVerified();
      } else {
        setError(data?.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to verify OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
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
    setSending(true);
    try {
      const { data } = await apiClient.post("/auth/signup/send-otp", {
        email: email.trim(),
      });
      if (data.success) {
        setCountdown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
    setSending(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in">
          <div
            className="h-1.5 w-full"
            style={{
              background: "linear-gradient(90deg,#0284c7,#38bdf8,#0284c7)",
              backgroundSize: "200% 100%",
            }}
          />

          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Verify Your Email
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {step === 1 ? "Send verification code" : "Enter OTP"}
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

          <div className="px-6 pb-8 space-y-4">
            {error && (
              <div ref={errorRef} className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600">
                  <Mail className="h-6 w-6" />
                </div>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 -mt-1">
                  We will send a 6-digit verification code to{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {email}
                  </span>
                </p>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending
                      OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            ) : (
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

                <div
                  className="flex justify-center gap-2"
                  onPaste={handleOtpPaste}
                >
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`signup-otp-${i}`}
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
            )}
          </div>
        </div>
      </div>

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

export default SignupVerifyModal;
