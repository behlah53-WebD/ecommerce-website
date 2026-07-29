import React from "react";
import { TextField, InputAdornment, IconButton, CircularProgress, alpha } from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

const SearchBar = ({
  value = "",
  onChange,
  onClear,
  placeholder = "Search records...",
  loading = false,
  disabled = false,
  inputRef,
  sx = {},
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) onChange(e);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      variant="outlined"
      size="small"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "#6366f1", fontSize: "1.2rem", transition: "color 0.2s ease" }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {loading ? (
              <CircularProgress size={16} sx={{ color: "#0284c7" }} />
            ) : value ? (
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
                onMouseDown={(e) => e.preventDefault()}
                sx={{
                  color: "#94a3b8",
                  "&:hover": {
                    color: "#e11d48",
                    background: alpha("#e11d48", 0.08),
                  },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null}
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: { xs: "100%", sm: 280 },
        "& .MuiOutlinedInput-root": {
          borderRadius: "14px",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          fontSize: "0.9rem",
          fontWeight: 500,
          transition: "all 0.2s ease",
          "& fieldset": {
            borderColor: "#e2e8f0",
            borderWidth: "1.5px",
          },
          "&:hover fieldset": {
            borderColor: "#6366f1",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#0284c7",
            borderWidth: "2px",
            boxShadow: "0 0 0 3px rgba(2, 132, 199, 0.08)",
          },
          "& input::placeholder": {
            color: "#94a3b8",
            opacity: 1,
          },
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default SearchBar;
