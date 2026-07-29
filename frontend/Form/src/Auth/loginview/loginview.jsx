import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { AuthStyles, commonTextFieldProps } from "../authstyles/style";

const LoginView = ({ auth }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const showIcons = isFocused || (auth.password && auth.password.length > 0);

  return (
    <Box component="form" onSubmit={auth.handleLogin}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={AuthStyles.viewTitle}>
          Welcome Back!
        </Typography>
        <Typography sx={AuthStyles.viewSubtitle}>
          Please enter your details to sign in.
        </Typography>
      </Box>

      <TextField
        {...commonTextFieldProps}
        label="Email Address"
        value={auth.email}
        onChange={(e) => auth.setEmail(e.target.value)}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlined sx={AuthStyles.iconAdornment} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...commonTextFieldProps}
        label="Password"
        type={showPassword ? "text" : "password"}
        value={auth.password}
        onChange={(e) => auth.setPassword(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{
                visibility: showIcons ? "visible" : "hidden",
                transition: "opacity 0.2s ease",
                opacity: showIcons ? 1 : 0,
              }}
            >
              <LockOutlined sx={AuthStyles.iconAdornment} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                visibility: showIcons ? "visible" : "hidden",
                transition: "opacity 0.2s ease",
                opacity: showIcons ? 1 : 0,
              }}
            >
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
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

      <Box sx={AuthStyles.forgotPasswordBox}>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => auth.switchView("verify-email")}
          sx={AuthStyles.forgotPasswordLink}
        >
          Forgot Password?
        </Link>
      </Box>

      <Button
        fullWidth
        type="submit"
        variant="contained"
        sx={AuthStyles.loginButton}
      >
        Sign In
      </Button>

      <Typography sx={AuthStyles.bottomText}>
        New on our platform?{" "}
        <Link
          component="button"
          type="button"
          onClick={() => auth.switchView("signup")}
          sx={AuthStyles.bottomLink}
        >
          Create an account
        </Link>
      </Typography>
    </Box>
  );
};

export default LoginView;