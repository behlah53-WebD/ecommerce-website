import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Sun, Moon, User, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenSearch }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, isLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accountName = currentUser?.name || currentUser?.displayName || 'Guest User';
  const accountEmail = currentUser?.email || currentUser?.authEmail || '';
  const accountAvatar =
    currentUser?.avatar ||
    currentUser?.photoURL ||
    currentUser?.image ||
    currentUser?.profileImage;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'Account', path: '/account' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90 transition-colors">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {}
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-black text-lg">
              L
            </span>
            <span>LUXE</span>
          </Link>

          {}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-primary-600 ${
                    isActive
                      ? 'text-primary-600 font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {}
          <div className="flex items-center gap-2">
            {}
            <button
              type="button"
              onClick={onOpenSearch}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>

            {}
            <Link
              to="/wishlist"
              className="relative hidden sm:block rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {}
            <div className="relative hidden sm:block group">
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                aria-label="Account"
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
                      {(accountName || accountEmail || 'B')[0].toUpperCase()}
                    </span>
                  )
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Link>

              <div className="invisible absolute right-0 top-full z-50 mt-3 w-72 translate-y-2 rounded-2xl border border-gray-100 bg-white p-4 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                  {isLoggedIn && accountAvatar ? (
                    <img
                      src={accountAvatar}
                      alt={accountName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-base font-bold text-white">
                      {isLoggedIn
                        ? (accountName || accountEmail || 'B')[0].toUpperCase()
                        : <User className="h-6 w-6" />}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {isLoggedIn ? accountName : 'Guest User'}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {isLoggedIn ? accountEmail || 'No email added' : 'Login to view profile'}
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    to="/account"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/account"
                    className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                </div>
              </div>
            </div>

            {}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
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

      {}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-gray-900 dark:text-primary-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900'
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
  );
};