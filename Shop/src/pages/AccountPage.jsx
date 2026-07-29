import React, { useState } from 'react';
import { User, Package, Heart, LogOut, Settings, ShoppingBag, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ForgotPasswordModal from '../components/common/ForgotPasswordModal';
import SignupVerifyModal from '../components/common/SignupVerifyModal';

export const AccountPage = () => {
  const { currentUser, isLoggedIn, login, signup, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (!otpVerified) {
      setErrorMsg('Please verify your email before registering.');
      setLoading(false);
      return;
    }

    const res = await signup({ name, email, password: signupPassword });
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(async () => {
        await login(email, signupPassword);
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyEmail = () => {
    setErrorMsg('');
    setVerifyOpen(true);
  };

  const handleOtpVerified = () => {
    setOtpVerified(true);
    setVerifyOpen(false);
    setErrorMsg('');
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
      <div className="mx-auto max-w-md px-4 py-12 lg:py-20">
        <div className="rounded-3xl bg-white p-8 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 shadow-inner">
            <User className="h-8 w-8" />
          </div>

          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
                setOtpVerified(false);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
                setOtpVerified(false);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Register (Buyer)
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="buyer@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    id="forgot-password-btn"
                    onClick={() => setForgotOpen(true)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In as Buyer'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="buyer@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                {otpVerified && (
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Email verified
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Account Role
                </label>
                <select
                  disabled
                  value="Buyer"
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-primary-400 cursor-not-allowed"
                >
                  <option value="Buyer">Buyer (Fixed for Shop)</option>
                </select>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 italic">
                  * Role is automatically fixed as Buyer for Shop accounts.
                </p>
              </div>

              {!otpVerified ? (
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={loading || !email.trim()}
                  className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" /> Verify Email
                    </>
                  )}
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
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
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupConfirm ? "text" : "password"}
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showSignupConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {signupConfirmPassword && signupConfirmPassword === signupPassword && (
                      <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Register Buyer Account'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
        {/* Forgot Password Modal */}
        <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
        {/* Signup Email Verification Modal */}
        <SignupVerifyModal isOpen={verifyOpen} onClose={handleVerifyModalClose} email={email} onVerified={handleOtpVerified} />
      </div>
    );
  }

  const initials = (currentUser.name || currentUser.authEmail || 'Buyer User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-2xl font-bold text-white shadow-lg shadow-primary-500/30">
            {initials}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
              {currentUser.name || 'Buyer User'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentUser.authEmail || currentUser.email || ''}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              {currentUser.role || 'Buyer'} Account
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Active Cart Items</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{totalItems} Items in Cart</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/50">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Saved Wishlist</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{wishlistCount} Saved Items</p>
          </div>
        </div>

        <div
          className="rounded-2xl bg-white p-6 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 cursor-pointer hover:border-primary-200 dark:hover:border-primary-800 transition-colors group"
          onClick={() => navigate('/orders')}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
            <Package className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <p className="text-xs text-primary-600 dark:text-primary-400 group-hover:underline">View my orders →</p>
          </div>
        </div>
      </div>
    </div>
  );
};