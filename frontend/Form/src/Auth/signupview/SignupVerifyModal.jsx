import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  IconButton,
  InputAdornment,
  alpha,
} from "@mui/material";
import {
  Close,
  EmailOutlined,
  Key,
  Visibility,
  VisibilityOff,
  LockOutlined,
} from "@mui/icons-material";
import { apiPost } from "@/API/api";
import { AuthStyles, commonTextFieldProps } from "../authstyles/style";

const SignupVerifyModal = ({ open, onClose, email, onSignup }) => {
  const [step, setStep] = useState(1);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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
      const res = await apiPost("/auth/signup/send-otp", {
        email: email.trim(),
      });
      if (res.data?.success) {
        setStep(2);
        setCountdown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(res.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please try again.",
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
      const res = await apiPost("/auth/signup/verify-otp", {
        email: email.trim(),
        otp: currentOtp,
      });
      if (res.data?.success) {
        setStep(3);
      } else {
        setError(res.data?.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to verify OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const success = await onSignup(password, confirmPassword);
      if (!success) {
        setError("Failed to create account. Please try again.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setOtpDigits(["", "", "", "", "", ""]);
    setSending(true);
    try {
      const res = await apiPost("/auth/signup/send-otp", {
        email: email.trim(),
      });
      if (res.data?.success) {
        setCountdown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(res.data?.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
      );
    }
    setSending(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          p: 0,
          "&:focus-visible": { outline: "none" },
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        },
      }}
    >
      <Box sx={{ p: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: "14px",
                bgcolor: alpha("#0284c7", 0.12),
              }}
            >
              {step === 1 ? (
                <EmailOutlined sx={{ color: "#0284c7", fontSize: 24 }} />
              ) : (
                <Key sx={{ color: "#0284c7", fontSize: 24 }} />
              )}
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#0f172a" }}
              >
                {step === 3 ? "Set Your Password" : "Verify Your Email"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                {step === 1
                  ? "Send verification code"
                  : step === 2
                    ? "Enter the 6-digit code"
                    : "Create a secure password"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#94a3b8" }}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ borderRadius: 2, mb: 1, fontSize: "0.85rem" }}
          >
            {error}
          </Alert>
        )}

        {step === 1 && (
          <Box component="form" onSubmit={handleSendOtp}>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", textAlign: "center", mb: 2 }}
            >
              We'll send a 6-digit verification code to{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#0f172a" }}>
                {email}
              </Box>
            </Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={sending}
              sx={{ ...AuthStyles.signupButton, height: 48 }}
            >
              {sending ? "Sending OTP..." : "Send OTP"}
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box component="form" onSubmit={handleVerifyOtp}>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", textAlign: "center", mb: 2 }}
            >
              Enter the 6-digit code sent to{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#0f172a" }}>
                {email}
              </Box>
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}
            >
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="one-time-code"
                  value={digit}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...otpDigits];
                    next[i] = d;
                    setOtpDigits(next);
                    if (d && i < 5) otpRefs.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpDigits[i] && i > 0) {
                      otpRefs.current[i - 1]?.focus();
                    }
                    if (e.key === "ArrowLeft" && i > 0) {
                      otpRefs.current[i - 1]?.focus();
                    }
                    if (e.key === "ArrowRight" && i < 5) {
                      otpRefs.current[i + 1]?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    const next = ["", "", "", "", "", ""];
                    pasted.split("").forEach((ch, idx) => {
                      next[idx] = ch;
                    });
                    setOtpDigits(next);
                    const nextFocus = Math.min(pasted.length, 5);
                    otpRefs.current[nextFocus]?.focus();
                  }}
                  style={{
                    width: 44,
                    height: 52,
                    borderRadius: 12,
                    border: "2px solid #cbd5e1",
                    textAlign: "center",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    background: digit ? "#f0fdfa" : "#ffffff",
                    borderColor: digit ? "#0284c7" : "#93c5fd",
                    outline: "none",
                  }}
                />
              ))}
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || otp.length < 6}
              sx={{ ...AuthStyles.signupButton, height: 48, mb: 1.5 }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <Typography
              variant="caption"
              sx={{ color: "#64748b", display: "block", textAlign: "center" }}
            >
              Didn't receive the code?{" "}
              {countdown > 0 ? (
                <Box
                  component="span"
                  sx={{ color: "#0284c7", fontWeight: 700 }}
                >
                  Resend in {countdown}s
                </Box>
              ) : (
                <Box
                  component="button"
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  sx={{
                    background: "none",
                    border: "none",
                    color: "#0284c7",
                    fontWeight: 700,
                    cursor: "pointer",
                    p: 0,
                    fontSize: "inherit",
                    "&:disabled": {
                      opacity: 0.5,
                      cursor: "not-allowed",
                    },
                  }}
                >
                  Resend OTP
                </Box>
              )}
            </Typography>
          </Box>
        )}

        {step === 3 && (
          <Box component="form" onSubmit={handleCreateAccount}>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", textAlign: "center", mb: 2 }}
            >
              Your email is verified. Set a secure password to finish creating
              your account.
            </Typography>

            <TextField
              {...commonTextFieldProps}
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={AuthStyles.iconAdornment} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{ color: "#6366f1", p: 0.5 }}
                    >
                      {showPassword ? (
                        <VisibilityOff sx={AuthStyles.iconAdornment} />
                      ) : (
                        <Visibility sx={AuthStyles.iconAdornment} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              {...commonTextFieldProps}
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={AuthStyles.confirmPasswordField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key sx={AuthStyles.iconAdornment} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{ color: "#6366f1", p: 0.5 }}
                    >
                      {showConfirm ? (
                        <VisibilityOff sx={AuthStyles.iconAdornment} />
                      ) : (
                        <Visibility sx={AuthStyles.iconAdornment} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={AuthStyles.signupButton}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default SignupVerifyModal;
