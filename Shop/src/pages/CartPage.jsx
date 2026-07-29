import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, totalItems } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8 min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="h-20 w-20 text-gray-300 dark:text-gray-700 mb-4" />
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Your Cart is Empty</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
          Looks like you haven't added any products to your shopping cart yet.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
        >
          Explore Catalog
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Shopping Cart ({totalItems})
        </h1>
        <button
          onClick={clearCart}
          className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, idx) => (
            <div
              key={`${item.id}-${item.color}-${item.size}-${idx}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs"
            >
              <div className="flex items-center gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl object-cover bg-gray-100 dark:bg-gray-800"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ${item.price} {item.color && `• Color: ${item.color}`} {item.size && `• Size: ${item.size}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.id, item.color, item.size, -1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 font-semibold text-sm text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.color, item.size, 1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id, item.color, item.size)}
                  className="text-red-500 hover:text-red-600 p-2"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="rounded-2xl bg-white p-6 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs h-fit space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>

          <div className="space-y-3 text-sm border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span className="text-primary-600 dark:text-primary-400">${grandTotal.toFixed(2)}</span>
          </div>

          <Link
            to="/checkout"
            className="block w-full text-center rounded-xl bg-primary-600 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};
