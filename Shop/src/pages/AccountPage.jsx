import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  Heart,
  LogOut,
  Settings,
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  CreditCard,
  Bell,
  Star,
  Clock,
  Ticket,
  ChevronRight,
  Edit3,
  Camera,
  Mail,
  Phone,
  Calendar,
  Crown,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import apiClient from "../api/apiClient";
import ForgotPasswordModal from "../components/common/ForgotPasswordModal";
import SignupVerifyModal from "../components/common/SignupVerifyModal";
import EditProfileModal from "../components/common/EditProfileModal";

export const AccountPage = () => {
  const { currentUser, isLoggedIn, login, signup, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState(() => {
    const urlAuthMode = searchParams.get("authMode");
    return urlAuthMode === "signup" ? "signup" : "login";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [accountOrders, setAccountOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  useEffect(() => {
    const fetchAccountOrders = async () => {
      try {
        const { data } = await apiClient.get("/orders/my");
        if (data.success) {
          setAccountOrders(data.data || []);
        } else {
          setOrdersError(data.message || "Failed to load orders.");
        }
      } catch (err) {
        setOrdersError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchAccountOrders();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (!otpVerified) {
      setErrorMsg("Please verify your email before registering.");
      setLoading(false);
      return;
    }

    const res = await signup({ name, email, password: signupPassword });
    setLoading(false);
    if (res.success) {
      setSuccessMsg("Account created successfully! Logging you in...");
      setTimeout(async () => {
        await login(email, signupPassword);
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyEmail = () => {
    setErrorMsg("");
    setVerifyOpen(true);
  };

  const handleOtpVerified = () => {
    setOtpVerified(true);
    setVerifyOpen(false);
    setErrorMsg("");
  };

  const handleVerifyModalClose = () => {
    setVerifyOpen(false);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setOtpVerified(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-black text-2xl shadow-lg shadow-primary-500/20 mb-4">
              Z
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to ZYRA
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sign in to your account or create a new one
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Auth Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                  setOtpVerified(false);
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                  authMode === "login"
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Sign In
                {authMode === "login" && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary-600 rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                  setOtpVerified(false);
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                  authMode === "signup"
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Register
                {authMode === "signup" && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary-600 rounded-full" />
                )}
              </button>
            </div>

            <div className="p-6">
              {/* Messages */}
              {errorMsg && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900 mb-4">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 mb-4">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {authMode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotOpen(true)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-primary-600 py-3.5 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                      />
                    </div>
                    {otpVerified && (
                      <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" /> Email verified
                        successfully
                      </p>
                    )}
                  </div>

                  {!otpVerified ? (
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={loading || !email.trim()}
                      className="w-full rounded-xl bg-primary-600 py-3.5 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" /> Verify Email
                          Address
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showSignupPassword ? "text" : "password"}
                            required
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 py-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowSignupPassword(!showSignupPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showSignupPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showSignupConfirm ? "text" : "password"}
                            required
                            value={signupConfirmPassword}
                            onChange={(e) =>
                              setSignupConfirmPassword(e.target.value)
                            }
                            placeholder="Re-enter your password"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 py-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowSignupConfirm(!showSignupConfirm)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showSignupConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {signupConfirmPassword &&
                          signupConfirmPassword === signupPassword && (
                            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5" /> Passwords
                              match
                            </p>
                          )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-primary-600 py-3.5 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        <ForgotPasswordModal
          isOpen={forgotOpen}
          onClose={() => setForgotOpen(false)}
        />
        <SignupVerifyModal
          isOpen={verifyOpen}
          onClose={handleVerifyModalClose}
          email={email}
          onVerified={handleOtpVerified}
        />
      </div>
    );
  }

  const initials = (currentUser.name || currentUser.authEmail || "Buyer User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const quickStats = [
    {
      icon: ShoppingBag,
      label: "Cart Items",
      value: totalItems,
      color:
        "bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400",
    },
    {
      icon: Heart,
      label: "Wishlist",
      value: wishlistCount,
      color: "bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400",
    },
    {
      icon: Package,
      label: "Orders",
      value: accountOrders.length,
      color:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      icon: Star,
      label: "Reviews",
      value: 0,
      color:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 lg:h-24 lg:w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-3xl lg:text-4xl font-bold text-white shadow-lg ring-4 ring-white/20">
                {initials}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-600 hover:text-primary-600">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {currentUser.name || "Buyer User"}
                </h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm flex items-center gap-1">
                  <Crown className="h-3 w-3 text-yellow-300" />
                  Premium
                </span>
              </div>
              <p className="text-white/80 text-sm mb-3">
                {currentUser.authEmail || currentUser.email || ""}
              </p>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Member since{" "}
                  {currentUser.createdAt
                    ? new Date(currentUser.createdAt).getFullYear()
                    : "2024"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4" />
                  {currentUser.loyaltyPoints || 0} Loyalty Points
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "wishlist") navigate("/wishlist");
                    if (tab.id === "orders") navigate("/orders");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 rounded-full">
                      {tab.count}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              ))}
            </div>

            {/* Loyalty Card */}
            <div className="mt-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5" />
                <span className="font-bold text-sm">Loyalty Program</span>
              </div>
              <p className="text-3xl font-black mb-1">
                {currentUser.loyaltyPoints || 0}
              </p>
              <p className="text-xs text-white/80 mb-3">Points Earned</p>
              <div className="w-full bg-white/30 rounded-full h-2 mb-2">
                <div
                  className="bg-white rounded-full h-2"
                  style={{
                    width: `${Math.min(((currentUser.loyaltyPoints || 0) / 1000) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-white/70">
                {1000 - (currentUser.loyaltyPoints || 0) > 0
                  ? `${1000 - (currentUser.loyaltyPoints || 0)} points to next reward`
                  : "You reached the next reward!"}
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Recent Orders
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Your latest purchases
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/orders")}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                  >
                    View All <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600 mr-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Loading orders...
                    </span>
                  </div>
                ) : ordersError ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {ordersError}
                    </p>
                  </div>
                ) : accountOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      No orders yet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      When you place an order, it will appear here.
                    </p>
                    <button
                      onClick={() => navigate("/shop")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Order ID
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Date
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Status
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Items
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {accountOrders.slice(0, 3).map((order, index) => {
                        const date = new Date(
                          order.createdAt,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <tr
                            key={order._id || index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                            onClick={() => navigate("/orders")}
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                {order.orderId}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {date}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : order.status === "Processing"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                      : order.status === "Shipped"
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                        : order.status === "Cancelled"
                                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                }`}
                              >
                                {order.status || "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {order.items?.length || 0} items
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                ${order.grandTotal?.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate("/wishlist")}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400 group-hover:scale-110 transition-transform">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      My Wishlist
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {wishlistCount} saved items
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate("/shop")}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Continue Shopping
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Browse our collections
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      My Coupons
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      0 active coupons
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      0 unread messages
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
    </div>
  );
};
