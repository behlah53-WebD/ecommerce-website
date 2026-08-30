import { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Slide,
} from "@mui/material";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";

export function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    // Check if in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    if (isStandalone) {
      return;
    }

    const isDismissed = sessionStorage.getItem("pwa_admin_dismissed");
    if (isDismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    const handleAppInstalled = () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowRecovery(true);
      const timer = setTimeout(() => setShowRecovery(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRecovery(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    sessionStorage.setItem("pwa_admin_dismissed", "true");
  };

  return (
    <>
      {/* Offline Status Alert */}
      {(!isOnline || showRecovery) && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: !isOnline ? "#dc2626" : "#16a34a",
            color: "#ffffff",
            py: 0.75,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            fontSize: "0.8125rem",
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {!isOnline ? (
            <>
              <WifiOffRoundedIcon sx={{ fontSize: 18 }} />
              <span>Offline Mode: Operating with cached app shell.</span>
            </>
          ) : (
            <>
              <WifiRoundedIcon sx={{ fontSize: 18 }} />
              <span>Connected: You are back online.</span>
            </>
          )}
        </Box>
      )}

      {/* PWA Install Banner */}
      <Slide direction="up" in={showInstall} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            left: { xs: 16, sm: "auto" },
            maxWidth: { sm: 400 },
            zIndex: 9998,
            p: 2,
            borderRadius: 3,
            backgroundColor: "#0f172a",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component="img"
            src="/pwa-192x192.png"
            alt="Zyra Admin"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              objectFit: "contain",
              backgroundColor: "rgba(255,255,255,0.05)",
              p: 0.5,
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>
              Install Admin Portal
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", display: "block" }}>
              Fast standalone access for dashboard & orders.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleInstallClick}
            startIcon={<GetAppRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              px: 1.75,
              py: 0.75,
              fontSize: "0.75rem",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.9)",
              },
            }}
          >
            Install
          </Button>
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{
              color: "rgba(255,255,255,0.6)",
              "&:hover": { color: "#ffffff" },
            }}
            aria-label="Dismiss prompt"
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Paper>
      </Slide>
    </>
  );
}

export default PwaPrompt;
