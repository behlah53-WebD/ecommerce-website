import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Snackbar, Alert, alpha } from "@mui/material";
import AuthPageMui from "../Auth/login";
import Form from "@/Pages/Form/form";
import Dash from "@/components/dash";
import Sidebar from "@/components/sidebar";
import AdminRequests from "@/Pages/Form/components/AdminRequests";
import UsersDirectory from "@/components/UsersDirectory";
import AdminOrders from "@/Pages/Form/components/AdminOrders";
import SellerOrders from "@/Pages/Form/components/SellerOrders";
import { clearAuth, getUserFromToken, apiGet } from "@/API/api";

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("accessToken")
  );
  const [activeView, setActiveView] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(() => getUserFromToken());

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const handleLogoutEvent = () => {
      setIsLoggedIn(false);
      setActiveView("dashboard");
      setCurrentUser(null);
    };
    window.addEventListener("logout", handleLogoutEvent);
    return () => window.removeEventListener("logout", handleLogoutEvent);
  }, []);

  
  useEffect(() => {
    if (isLoggedIn) {
      const decodedUser = getUserFromToken();
      if (decodedUser) setCurrentUser(decodedUser);

      apiGet("/auth/me")
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setCurrentUser(res.data.data);
          }
        })
        .catch(() => {});
    } else {
      setCurrentUser(null);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveView("dashboard");
  };

  const handleChangeView = (view) => {
    if (view === "logout") {
      handleLogout();
      return;
    }
    setActiveView(view);
  };

  if (!isLoggedIn) {
    return <AuthPageMui setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar
        activeView={activeView}
        onChangeView={handleChangeView}
        currentUser={currentUser}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "calc(100% - 260px)",
          minHeight: "100vh",
          overflow: "auto",
          background: "#f8fafc",
        }}
      >
        {activeView === "dashboard" && <Dash />}
        {activeView === "user" && (
          <Form onLogout={handleLogout} currentUser={currentUser} />
        )}
        {activeView === "requests" && (
          <AdminRequests showToast={showToast} />
        )}
        {activeView === "orders" && (
          <AdminOrders showToast={showToast} />
        )}
        {activeView === "users" && <UsersDirectory roleFilter="All" />}
        {activeView === "buyers" && <UsersDirectory roleFilter="Buyer" />}
        {activeView === "sellers" && <UsersDirectory roleFilter="Seller" />}
        {activeView === "seller-orders" && (
          <SellerOrders showToast={showToast} currentUser={currentUser} />
        )}
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{
            borderRadius: 3,
            width: "100%",
            background: "#ffffff",
            color: "#0f172a",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
            border: "1px solid #e2e8f0",
            fontWeight: 600,
            "& .MuiAlert-icon": { color: "inherit" },
            "& .MuiAlert-action": { color: "#64748b" },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
