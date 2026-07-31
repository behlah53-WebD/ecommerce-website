import React from "react";
import { Box, Typography, TextField, Button, Link } from "@mui/material";
import { AuthStyles, commonTextFieldProps } from "../authstyles/style";

const ForgotPasswordView = ({ auth }) => {
  return (
    <Box
      component="form"
      onSubmit={
        auth.view === "verify-email"
          ? auth.handleVerifyEmail
          : auth.handleChangePassword
      }
    >
      <Typography variant="h5" sx={AuthStyles.viewTitle}>
        Reset Password
      </Typography>
      <Typography sx={AuthStyles.viewSubtitle}>
        {auth.view === "verify-email"
          ? "Enter your email to verify your account."
          : "Set your new secure password."}
      </Typography>
      
      {auth.view === "verify-email" && (
        <TextField
          {...commonTextFieldProps}
          label="Email Address"
          type="email"
          value={auth.email}
          onChange={(e) => auth.setEmail(e.target.value)}
          required
        />
      )}
      
      {auth.view === "change-password" && (
        <TextField
          {...commonTextFieldProps}
          label="Enter OTP"
          value={auth.otp}
          onChange={(e) => auth.setOtp(e.target.value)}
          required
        />
      )}
      
      {auth.view === "change-password" && (
        <TextField
          {...commonTextFieldProps}
          label="New Password"
          type="password"
          value={auth.password}
          onChange={(e) => auth.setPassword(e.target.value)}
          required
        />
      )}
      
      {auth.view === "change-password" && (
        <TextField
          {...commonTextFieldProps}
          label="Confirm New Password"
          type="password"
          value={auth.confirmPassword}
          onChange={(e) => auth.setConfirmPassword(e.target.value)}
          required
        />
      )}
      
      <Button fullWidth type="submit" variant="contained" sx={AuthStyles.resetButton}>
        {auth.view === "verify-email" ? "Verify Email" : "Update Password"}
      </Button>
      
      <Link
        component="button"
        type="button"
        onClick={() => auth.switchView("login")}
        sx={AuthStyles.backToLoginLink}
      >
        Back to Login
      </Link>
    </Box>
  );
};

export default ForgotPasswordView;