import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';

export const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden">
      {}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 h-full w-full max-w-md">
        <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-2xl">
          {}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shopping Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white">Your cart is empty</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                  Discover products and add items to your cart.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}-${idx}`}
                  className="flex gap-4 border-b border-gray-100 pb-4 dark:border-gray-800"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      ₹{item.price} {item.color && `• ${item.color}`} {item.size && `• ${item.size}`}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.color, item.size, -1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.color, item.size, 1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.color, item.size)}
                        className="text-red-500 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 p-6 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white mb-4">
                <span>Subtotal</span>
                 <span>                {formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center rounded-lg bg-primary-600 py-3 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center rounded-lg border border-gray-300 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
