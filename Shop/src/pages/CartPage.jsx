import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Clock,
  Tag,
  ChevronRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
  } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="flex h-28 w-28 mx-auto items-center justify-center rounded-3xl bg-gray-100 dark:bg-gray-800 mb-6">
            <ShoppingBag className="h-14 w-14 text-gray-400" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Looks like you haven't added any products to your shopping cart yet.
            Explore our collections and find something you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
            >
              Explore Products
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-3.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Browse Categories
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 mb-2">
                <Truck className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                Free Shipping
              </p>
            </div>
            <div className="text-center">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                Secure Checkout
              </p>
            </div>
            <div className="text-center">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 mb-2">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                24/7 Support
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;
  const savings = shipping === 0 ? 15 : 0;
  const freeShippingProgress = Math.min((subtotal / 100) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        {/* Breadcrumb & Header */}
        <div className="mb-6 lg:mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          </div>
        </div>

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Clear Cart?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to remove all items from your cart?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress */}
            {subtotal < 100 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Free shipping on orders above ₹100!
                  </p>
                </div>
                <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Add ₹{(100 - subtotal).toFixed(2)} more to qualify for free
                  shipping
                </p>
              </div>
            )}

            {cartItems.map((item, idx) => (
              <div
                key={`${item.id}-${item.color}-${item.size}-${idx}`}
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-4 lg:p-5 flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-28 w-28 lg:h-32 lg:w-32 rounded-xl object-cover bg-gray-100 dark:bg-gray-800"
                      />
                    ) : (
                      <div className="h-28 w-28 lg:h-32 lg:w-32 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {item.color && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                              Size: {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-lg lg:text-xl font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.color, item.size, -1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-sm text-gray-900 dark:text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.color, item.size, 1)
                          }
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 hidden sm:block">
                          ₹{item.price.toFixed(2)} each
                        </span>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.color, item.size)
                          }
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon Code */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                />
                <button className="px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-5 lg:p-6 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Order Summary
                  </h2>
                </div>

                <div className="p-5 lg:p-6 space-y-4">
                  {/* Price Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal ({totalItems} items)
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Shipping
                      </span>
                      <span
                        className={
                          shipping === 0
                            ? "font-semibold text-emerald-600 dark:text-emerald-400"
                            : "font-semibold text-gray-900 dark:text-white"
                        }
                      >
                        {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    {shipping === 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">
                        <Truck className="h-3 w-3" />
                        You saved ₹15.00 on shipping!
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax (8%)
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{tax.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          ₹{grandTotal.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Including all taxes
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary-600 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 active:scale-[0.99] shadow-lg shadow-primary-500/20 mt-2"
                  >
                    Proceed to Checkout
                    <ChevronRight className="h-5 w-5" />
                  </Link>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Secure
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Truck className="h-3.5 w-3.5" />
                      {shipping === 0 ? "Free Shipping" : "Fast Delivery"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      30-Day Returns
                    </div>
                  </div>
                </div>
              </div>

              {/* Accepted Payment Methods */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Accepted Payments
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    VISA
                  </div>
                  <div className="h-8 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    MC
                  </div>
                  <div className="h-8 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    AMEX
                  </div>
                  <div className="h-8 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    PAYPAL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
