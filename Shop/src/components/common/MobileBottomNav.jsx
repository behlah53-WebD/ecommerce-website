import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  LayoutGrid,
  Heart,
  User,
} from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

export function MobileBottomNav() {
  const location = useLocation();
  const { wishlistCount } = useWishlist();
  const { currentUser, isLoggedIn } = useAuth();

  const accountAvatar =
    currentUser?.avatar ||
    currentUser?.photoURL ||
    currentUser?.image ||
    currentUser?.profileImage;

  const accountName =
    currentUser?.name || currentUser?.displayName || "";

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      exact: true,
    },
    {
      name: "Shop",
      path: "/shop",
      icon: ShoppingBag,
    },
    {
      name: "Categories",
      path: "/categories",
      icon: LayoutGrid,
    },
    {
      name: "Wishlist",
      path: "/wishlist",
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      name: "Account",
      path: "/account",
      icon: User,
      hasAvatar: isLoggedIn,
    },
  ];

  return (
    <div
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-[9990] block lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom,0px)] transition-colors"
    >
      <nav className="mx-auto flex h-16 w-full max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-primary-600 dark:text-primary-400 font-semibold"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {/* Active top glow indicator */}
              {isActive && (
                <span className="absolute -top-[1px] h-0.5 w-8 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 shadow-[0_0_8px_rgba(37,99,235,0.8)] dark:from-primary-400 dark:via-primary-500 dark:to-primary-400" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                {item.hasAvatar ? (
                  accountAvatar ? (
                    <img
                      src={accountAvatar}
                      alt={accountName || "User"}
                      className={`h-6 w-6 rounded-full object-cover ring-2 transition-all ${
                        isActive
                          ? "ring-primary-600 dark:ring-primary-400 scale-105"
                          : "ring-gray-200 dark:ring-gray-700"
                      }`}
                    />
                  ) : (
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white transition-all ${
                        isActive
                          ? "bg-primary-600 ring-2 ring-primary-400/50 scale-105"
                          : "bg-gray-400 dark:bg-gray-600"
                      }`}
                    >
                      {(accountName || "U").charAt(0).toUpperCase()}
                    </div>
                  )
                ) : (
                  <ItemIcon
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isActive ? "scale-110 stroke-[2.3]" : "stroke-[1.8]"
                    }`}
                  />
                )}

                {/* Badge (e.g. wishlist count) */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white dark:ring-gray-950 animate-in zoom-in duration-200">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-1 text-[11px] tracking-tight transition-all duration-150 ${
                  isActive
                    ? "font-bold text-primary-600 dark:text-primary-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default MobileBottomNav;
