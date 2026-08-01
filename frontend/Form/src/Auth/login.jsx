import { Box, Paper, Typography } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./Hook/loginhooks";
import { AuthStyles } from "./authstyles/style"; 


import LoginView from "./loginview";
import SignupView from "./signupview/signup";
import SignupVerifyModal from "./signupview/SignupVerifyModal";
import ForgotPasswordView from "./forgotview/forgot"  ;

export default function AuthPageMui({ setIsLoggedIn }) {
  const auth = useAuth(setIsLoggedIn);

  return (
    <Box sx={AuthStyles.mainContainer}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Paper elevation={0} sx={AuthStyles.paperWrapper}>
        <Box sx={AuthStyles.accentLine} />
        <Box sx={AuthStyles.headerBox}>
          <Box component="img" src="../assets/Admin.png" sx={AuthStyles.logoImg} />
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

      {auth.verifyOpen && (
        <SignupVerifyModal
          open={auth.verifyOpen}
          onClose={() => auth.setVerifyOpen(false)}
          email={auth.email}
          onSignup={auth.handleSignupSubmit}
        />
      )}
    </Box>
  );
}