import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-colors mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-2xl font-bold text-gray-900 dark:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-black text-lg">
                Z
              </span>
              <span>ZYRA</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-gray-600 dark:text-gray-400">
              Discover curated collections of premium fashion and lifestyle
              products. Modern elegance designed for everyday life.
            </p>

            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                Subscribe to our newsletter
              </h4>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-2 flex max-w-md gap-2"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Shop
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  to="/shop"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?filter=new"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?filter=sale"
                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400"
                >
                  Sale Items
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Support
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <span className="text-gray-600 hover:text-primary-600 dark:text-gray-400 cursor-pointer">
                  Order Tracking
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-primary-600 dark:text-gray-400 cursor-pointer">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-primary-600 dark:text-gray-400 cursor-pointer">
                  Returns & Exchanges
                </span>
              </li>
              <li>
                <span className="text-gray-600 hover:text-primary-600 dark:text-gray-400 cursor-pointer">
                  Size Guide
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Connect
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-600" />
                <span>support@zyrashop.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-600" />
                <span>+1 (800) 555-ZYRA</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" />
                <span>New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Zyra Storefront. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-gray-400 hover:text-primary-600 cursor-pointer">
              <Twitter className="h-5 w-5" />
            </span>
            <span className="text-gray-400 hover:text-primary-600 cursor-pointer">
              <Instagram className="h-5 w-5" />
            </span>
            <span className="text-gray-400 hover:text-primary-600 cursor-pointer">
              <Github className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;