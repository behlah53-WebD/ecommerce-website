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
  InputLabel,
} from "@mui/material";
import {
  EmailOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { AuthStyles, commonTextFieldProps } from "../authstyles/style";

const SignupView = ({ auth }) => {
  return (
    <Box>
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
        <InputLabel sx={AuthStyles.roleLabel}>Role</InputLabel>
        <Select
          value={auth.role}
          onChange={(e) => auth.setRole(e.target.value)}
          required
          displayEmpty
          label="Role"
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

      <Box>
        <Button
          fullWidth
          type="button"
          variant="contained"
          sx={AuthStyles.signupButton}
          onClick={() => {
            if (!auth.email.trim()) {
              auth.setEmailError("Email is required to verify.");
              return;
            }
            auth.handleVerifyEmailClick();
          }}
        >
          Verify Email Address
        </Button>
        <Typography sx={{ ...AuthStyles.bottomText, mt: 2 }}>
          Verify your email to continue, then set your password in the next
          step.
        </Typography>
      </Box>

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
