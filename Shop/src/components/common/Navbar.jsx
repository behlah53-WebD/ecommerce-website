import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  Sun,
  Moon,
  User,
  Menu,
  X,
  Package,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Clock,
  Star,
  Ticket,
  Crown,
  Gift,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

export const Navbar = ({ onOpenSearch }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, isLoggedIn, logout } = useAuth();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const closeMobileMenuOnResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeMobileMenuOnResize);

    return () => {
      window.removeEventListener("resize", closeMobileMenuOnResize);
    };
  }, [mobileMenuOpen]);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setShowProfileDropdown(false);
  };

  const accountName =
    currentUser?.name || currentUser?.displayName || "Guest User";

  const accountEmail = currentUser?.email || currentUser?.authEmail || "";

  const accountAvatar =
    currentUser?.avatar ||
    currentUser?.photoURL ||
    currentUser?.image ||
    currentUser?.profileImage;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Categories", path: "/categories" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Account", path: "/account" },
  ];

  const accountMenuItems = [
    {
      icon: User,
      label: "My Profile",
      path: "/account",
    },
    {
      icon: Package,
      label: "My Orders",
      path: "/orders",
      badge: "2",
      badgeColor:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      icon: Heart,
      label: "Wishlist",
      path: "/wishlist",
      count: wishlistCount,
    },
    {
      icon: MapPin,
      label: "Addresses",
      path: "/account/addresses",
    },
    {
      icon: CreditCard,
      label: "Payment Methods",
      path: "/account/payments",
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/account/notifications",
      dot: true,
    },
  ];

  const activityItems = [
    {
      icon: Star,
      label: "My Reviews",
      path: "/account/reviews",
    },
    {
      icon: Clock,
      label: "Recently Viewed",
      path: "/account/recent",
    },
    {
      icon: Ticket,
      label: "Coupons & Offers",
      path: "/account/coupons",
      badge: "3",
      badgeColor:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
  ];

  const settingsItems = [
    {
      icon: Settings,
      label: "Settings",
      path: "/account/settings",
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      path: "/help",
    },
  ];

  const renderMenuLink = (item, index) => {
    const ItemIcon = item.icon;

    return (
      <Link
        key={`${item.path}-${index}`}
        to={item.path}
        onClick={closeMenus}
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
      >
        <ItemIcon className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-primary-500" />

        <span className="flex-1">{item.label}</span>

        {item.badge && (
          <span
            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor}`}
          >
            {item.badge}
          </span>
        )}

        {item.count > 0 && (
          <span className="flex-shrink-0 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
            {item.count}
          </span>
        )}

        {item.dot && (
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
        )}

        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 group-hover:text-primary-400" />
      </Link>
    );
  };

  return (
    <>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }


          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
          }


          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }


          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }


          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #374151;
          }


          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #4b5563;
          }
        `}
      </style>

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-[9999] w-full border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md transition-colors dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((currentValue) => !currentValue);
                setShowProfileDropdown(false);
              }}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link
              to="/"
              onClick={closeMenus}
              className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-lg font-black text-white">
                Z
              </span>

              <span>ZYRA</span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary-600 ${
                      isActive
                        ? "font-semibold text-primary-600"
                        : "text-gray-700 dark:text-gray-300"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative hidden rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 sm:block"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />

                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Profile dropdown */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown((currentValue) => !currentValue);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  aria-label="Account"
                  aria-expanded={showProfileDropdown}
                >
                  {isLoggedIn ? (
                    accountAvatar ? (
                      <img
                        src={accountAvatar}
                        alt={accountName}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
                        {(accountName || accountEmail || "B")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 top-full z-[10000] mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                    {isLoggedIn ? (
                      <>
                        {/* User information */}
                        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 p-5 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
                          <div className="flex items-center gap-3">
                            {accountAvatar ? (
                              <img
                                src={accountAvatar}
                                alt={accountName}
                                className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                              />
                            ) : (
                              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-base font-bold text-white">
                                {(accountName || accountEmail || "B")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {accountName}
                              </p>

                              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {accountEmail || "No email added"}
                              </p>

                              <div className="mt-1 flex items-center gap-1">
                                <Crown className="h-3 w-3 text-yellow-500" />

                                <span className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-500">
                                  Premium Member
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick stats */}
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <div className="rounded-lg bg-white p-2 text-center dark:bg-gray-800">
                              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                12
                              </p>

                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Orders
                              </p>
                            </div>

                            <div className="rounded-lg bg-white p-2 text-center dark:bg-gray-800">
                              <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                                {wishlistCount}
                              </p>

                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Wishlist
                              </p>
                            </div>

                            <div className="rounded-lg bg-white p-2 text-center dark:bg-gray-800">
                              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                450
                              </p>

                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Points
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Scrollable menu */}
                        <div className="custom-scrollbar max-h-[300px] overflow-y-auto">
                          <div className="p-2">
                            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                              Account
                            </p>

                            <div className="space-y-0.5">
                              {accountMenuItems.map(renderMenuLink)}
                            </div>
                          </div>

                          <div className="mx-3 border-t border-gray-100 dark:border-gray-700" />

                          <div className="p-2">
                            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                              Activity
                            </p>

                            <div className="space-y-0.5">
                              {activityItems.map(renderMenuLink)}
                            </div>
                          </div>

                          <div className="mx-3 border-t border-gray-100 dark:border-gray-700" />

                          <div className="p-2">
                            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                              Settings
                            </p>

                            <div className="space-y-0.5">
                              {settingsItems.map(renderMenuLink)}
                            </div>
                          </div>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              logout();
                              navigate("/account");
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Guest user */
                      <div className="p-5 text-center">
                        <div className="mb-3 flex justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Welcome to ZYRA
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Sign in to access your account and enjoy exclusive
                          benefits.
                        </p>

                        <div className="mt-5 space-y-2">
                          <Link
                            to="/account?authMode=login"
                            onClick={closeMenus}
                            className="block w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-primary-700"
                          >
                            Sign In
                          </Link>

                          <Link
                            to="/account?authMode=signup"
                            onClick={closeMenus}
                            className="block w-full rounded-lg bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-600 transition-all duration-150 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                          >
                            Create Account
                          </Link>
                        </div>

                        <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-700">
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Gift className="h-3.5 w-3.5" />
                            <span>New members get 10% off first order</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />

                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:hidden">
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-600 dark:bg-gray-900 dark:text-primary-400"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;