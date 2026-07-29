import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
  GroupOutlined,
} from "@mui/icons-material";
import { AuthStyles, commonTextFieldProps } from "../authstyles/style";

const SignupView = ({ auth }) => {
  return (
    <Box component="form" onSubmit={auth.handleSignup}>
      <Typography variant="h5" sx={AuthStyles.viewTitle}>
        Join Us Today
      </Typography>
      <Typography sx={AuthStyles.viewSubtitle}>
        Start your journey with our admin Dashboard.
      </Typography>

      <TextField
        {...commonTextFieldProps}
        label="Full Name"
        value={auth.name}
        onChange={(e) => auth.setName(e.target.value)}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonOutlined sx={AuthStyles.iconAdornment} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...commonTextFieldProps}
        label="Email Address"
        value={auth.email}
        error={!!auth.emailError}
        helperText={auth.emailError}
        required
        onChange={(e) => {
          auth.setEmail(e.target.value);
          auth.setEmailError("");
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlined sx={AuthStyles.iconAdornment} />
            </InputAdornment>
          ),
        }}
      />

      <FormControl fullWidth sx={AuthStyles.roleSelect}>
        <Typography sx={AuthStyles.roleLabel}>Role</Typography>
        <Select
          value={auth.role}
          onChange={(e) => auth.setRole(e.target.value)}
          required
          displayEmpty
          sx={AuthStyles.roleSelect}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(148, 163, 184, 0.12)",
                borderRadius: "16px",
                mt: 1,
                "& .MuiMenuItem-root": {
                  color: "#94a3b8",
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  "&:hover": {
                    backgroundColor: "rgba(13, 148, 136, 0.15)",
                    color: "#f1f5f9",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(13, 148, 136, 0.2)",
                    color: "#f1f5f9",
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            Select your role
          </MenuItem>
          {!auth.adminExists && <MenuItem value="Admin">Admin</MenuItem>}
          <MenuItem value="Seller">Seller</MenuItem>
          <MenuItem value="Buyer">Buyer</MenuItem>
        </Select>
        {auth.adminExists && (
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#64748b",
              mt: 0.5,
              fontStyle: "italic",
            }}
          >
            * Admin role unavailable (maximum 1 Admin allowed).
          </Typography>
        )}
      </FormControl>

      <TextField
        {...commonTextFieldProps}
        label="Password"
        type="password"
        value={auth.password}
        onChange={(e) => auth.setPassword(e.target.value)}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlined sx={AuthStyles.iconAdornment} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...commonTextFieldProps}
        label="Confirm Password"
        type="password"
        value={auth.confirmPassword}
        onChange={(e) => auth.setConfirmPassword(e.target.value)}
        required
        sx={AuthStyles.confirmPasswordField}
      />

      <Button
        fullWidth
        type="submit"
        variant="contained"
        sx={AuthStyles.signupButton}
      >
        Create Account
      </Button>

      <Typography sx={AuthStyles.bottomText}>
        Already have an account?{" "}
        <Link
          component="button"
          type="button"
          onClick={() => auth.switchView("login")}
          sx={AuthStyles.bottomLink}
        >
          Sign in instead
        </Link>
      </Typography>
    </Box>
  );
};

export default SignupView;
