import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

export const CheckoutPage = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { isLoggedIn, promptLogin } = useAuth();
  const navigate = useNavigate();
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLoggedIn) {
      promptLogin('Please sign in to place an order.');
      return;
    }

    if (!cartItems.length) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.08;
    const grandTotal = subtotal + shipping + tax;

    const payload = {
      items: cartItems.map((item) => ({
        productId: item.productId || item.id || item._id || '',
        name: item.name || 'Product',
        price: item.price || 0,
        image: item.image || '',
        color: item.color || null,
        size: item.size || null,
        quantity: item.quantity || 1,
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      },
      subtotal,
      shipping,
      tax,
      grandTotal,
    };

    setLoading(true);
    try {
      const { data } = await apiClient.post('/orders', payload);
      if (data.success) {
        clearCart();
        setSubmittedOrderId(data.data?.orderId || '');
        setOrderSubmitted(true);
      } else {
        setErrorMsg(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center lg:px-8 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
          Order Placed Successfully!
        </h1>
        {submittedOrderId && (
          <p className="mt-2 text-xs font-mono text-gray-400 dark:text-gray-500">
            Order ID: {submittedOrderId}
          </p>
        )}
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Thank you for your purchase. We have received your order and it is now{' '}
          <span className="font-semibold text-primary-600 dark:text-primary-400">Processing</span>.
        </p>
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => navigate('/orders')}
            className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        {}
        <div className="lg:col-span-2 space-y-8">
          {}
          <div className="rounded-2xl bg-white p-6 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Shipping Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {}
          <div className="rounded-2xl bg-white p-6 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Secure Checkout — No Card Required
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  This is a demo store. Orders are saved to your account with no real payment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="rounded-2xl bg-white p-6 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs h-fit space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Order Summary
          </h2>

          {/* Items preview */}
          {cartItems.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto border-b border-gray-100 dark:border-gray-800 pb-3">
              {cartItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white shrink-0">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 text-sm border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax (8%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Grand Total</span>
            <span className="text-primary-600 dark:text-primary-400">${grandTotal.toFixed(2)}</span>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !cartItems.length}
            className="w-full rounded-xl bg-primary-600 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Complete Order ($${grandTotal.toFixed(2)})`
            )}
          </button>

          {!isLoggedIn && (
            <p className="text-xs text-center text-amber-600 dark:text-amber-400">
              You must be signed in to place an order.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
