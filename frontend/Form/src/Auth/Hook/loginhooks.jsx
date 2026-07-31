import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { getUserFromToken } from "@/API/api";

// Use environment variable for the base URL (supports both Create React App and Vite)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const useAuth = (setIsLoggedIn) => {
  const [view, setView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [emailError, setEmailError] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getUserFromToken());
  const [adminExists, setAdminExists] = useState(false);
  const [otp, setOtp] = useState("");

  const fetchAdminStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/check-admin`);
      if (res.data && res.data.success) {
        setAdminExists(res.data.adminExists);
      }
    } catch (err) {
      console.error("Failed to check admin status:", err);
    }
  }, []);

  useEffect(() => {
    fetchAdminStatus();
  }, [fetchAdminStatus, view]);

  const switchView = (newView) => {
    setView(newView);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setEmailError("");
    setRole("");
    fetchAdminStatus();
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    setEmailError("");
    if (!role) {
      toast.error("Please select a role!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name,
        email,
        password,
        role,
      });
      if (response.data.success) {
        toast.success(response.data.message || "Account created successfully!");
        switchView("login");
      } else {
        toast.error(response.data.message || "Failed to create account.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errMsg =
        error.response?.data?.message || "Failed to connect to server.";
      if (errMsg.toLowerCase().includes("email")) {
        setEmailError(errMsg);
      }
      toast.error(errMsg);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      if (response.data.success) {
        const { accessToken, refreshToken, data: userData } = response.data;
        localStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
        if (userData) {
          setCurrentUser(userData);
        }
        toast.success(`Welcome back, ${userData?.name || "User"}!`);
        if (typeof setIsLoggedIn === "function") {
          setIsLoggedIn(true);
        }
      } else {
        toast.error(response.data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errMsg =
        error.response?.data?.message || "Failed to connect to server.";
      toast.error(errMsg);
    }
  };

  const handleVerifyEmail = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
        email,
      });
      if (response.data.success) {
        toast.success(response.data.message || "OTP sent to your email address.");
        setView("change-password");
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      const errMsg =
        error.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(errMsg);
    }
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const targetEmail = targetUser?.authEmail || email;
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/reset`, {
        email: targetEmail,
        otp,
        newPassword: password,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Password reset successfully!");
        setOtp("");
        setPassword("");
        setConfirmPassword("");
        switchView("login");
      } else {
        toast.error(response.data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errMsg =
        error.response?.data?.message || "Failed to reset password. Please try again.";
      toast.error(errMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setCurrentUser(null);
    if (typeof setIsLoggedIn === "function") {
      setIsLoggedIn(false);
    }
  };

  return {
    view,
    switchView,
    showPassword,
    setShowPassword,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    emailError,
    setEmailError,
    currentUser,
    setCurrentUser,
    adminExists,
    fetchAdminStatus,
    handleSignup,
    handleLogin,
    handleVerifyEmail,
    handleChangePassword,
    handleLogout,
    role,
    setRole,
    otp,
    setOtp,
  };
};