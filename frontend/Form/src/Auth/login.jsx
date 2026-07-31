import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./Hook/loginhooks";
import { AuthStyles } from "./authstyles/style"; 

import LoginView from "./loginview";
import SignupView from "./signupview/signup";
import ForgotPasswordView from "./forgotview/forgot"  ;

export default function AuthPageMui({ setIsLoggedIn }) {
  const auth = useAuth(setIsLoggedIn);

  return (
    <Box sx={AuthStyles.mainContainer}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Paper elevation={0} sx={AuthStyles.paperWrapper}>
        <Box sx={AuthStyles.accentLine} />
        <Box sx={AuthStyles.headerBox}>
          <Box sx={AuthStyles.logoImg}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <linearGradient id="adminGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#0d1b6e", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#1a56db", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path d="M50 5 L90 20 L90 50 C90 72 72 88 50 95 C28 88 10 72 10 50 L10 20 Z" fill="url(#adminGrad)" />
              <circle cx="50" cy="38" r="14" fill="white" opacity="0.95" />
              <ellipse cx="50" cy="72" rx="20" ry="13" fill="white" opacity="0.95" />
            </svg>
          </Box>
          <Typography sx={AuthStyles.headerText}>
            Admin-page
          </Typography>
        </Box>

        {auth.view === "login" && <LoginView auth={auth} />}
        
        {auth.view === "signup" && <SignupView auth={auth} />}
        
        {(auth.view === "verify-email" || auth.view === "change-password") && (
          <ForgotPasswordView auth={auth} />
        )}
      </Paper>
    </Box>
  );
}