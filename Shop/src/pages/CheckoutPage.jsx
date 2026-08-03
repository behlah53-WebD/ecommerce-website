import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  CreditCard,
  Truck,
  Lock,
  ChevronRight,
  Package,
  MapPin,
  Mail,
  User,
  Building,
  Hash,
  Phone,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

export const CheckoutPage = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { isLoggedIn, promptLogin } = useAuth();
  const navigate = useNavigate();

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentOpening, setPaymentOpening] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const shipping = subtotal > 100 ? 0 : 15;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = Number(
    (subtotal + shipping + tax).toFixed(2)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openRazorpayCheckout = (paymentData) => {
    if (!window.Razorpay) {
      setErrorMsg(
        "Razorpay Checkout is not loaded. Please refresh the page and try again."
      );
      return;
    }

    if (
      !paymentData?.keyId ||
      !paymentData?.razorpayOrderId ||
      !paymentData?.amount ||
      !paymentData?.currency ||
      !paymentData?.orderId
    ) {
      setErrorMsg("Invalid payment order data received from the server.");
      return;
    }

    const options = {
      key: paymentData.keyId,
      amount: Number(paymentData.amount),
      currency: paymentData.currency,
      name: "Your Store",
      description: `Payment for order ${paymentData.orderId}`,
      order_id: paymentData.razorpayOrderId,

      prefill: {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.trim(),
        contact: formData.phone.trim(),
      },

      notes: {
        orderId: paymentData.orderId,
      },

      theme: {
        color: "#2563eb",
      },

      handler: async (response) => {
        setPaymentOpening(false);
        setLoading(true);
        setErrorMsg("");

        try {
          if (
            !response?.razorpay_order_id ||
            !response?.razorpay_payment_id ||
            !response?.razorpay_signature
          ) {
            throw new Error("Incomplete Razorpay payment response.");
          }

          const verifyResponse = await apiClient.post(
            "/payments/verify-payment",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: paymentData.orderId,
            }
          );

          if (!verifyResponse.data?.success) {
            setErrorMsg(
              verifyResponse.data?.message ||
                "Payment verification failed."
            );
            return;
          }

          await clearCart();

          setSubmittedOrderId(paymentData.orderId);
          setOrderSubmitted(true);
        } catch (error) {
          setErrorMsg(
            error.response?.data?.message ||
              error.message ||
              "Payment verification failed."
          );
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          setPaymentOpening(false);
          setLoading(false);
          setErrorMsg(
            "Payment was cancelled or the checkout window was closed."
          );
        },
      },
    };

    const razorpayCheckout = new window.Razorpay(options);

    razorpayCheckout.on("payment.failed", (response) => {
      setPaymentOpening(false);
      setLoading(false);

      setErrorMsg(
        response?.error?.description ||
          "Payment failed. Please try another payment method."
      );
    });

    setPaymentOpening(true);
    razorpayCheckout.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (loading || paymentOpening) {
      return;
    }

    if (!isLoggedIn) {
      promptLogin("Please sign in to place an order.");
      return;
    }

    if (!cartItems.length) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "postalCode",
    ];

    const hasMissingField = requiredFields.some(
      (field) => !String(formData[field]).trim()
    );

    if (hasMissingField) {
      setErrorMsg("Please fill all shipping details.");
      return;
    }

    if (
      formData.phone &&
      !/^[0-9+\-()\s]{7,20}$/.test(formData.phone)
    ) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(
        "/payments/create-order",
        {
          shippingAddress: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
          },
        }
      );

      const responseData = response.data;

      if (!responseData?.success || !responseData?.data) {
        setErrorMsg(
          responseData?.message ||
            "Failed to create payment order."
        );
        return;
      }

      setLoading(false);
      openRazorpayCheckout(responseData.data);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Failed to create payment order."
      );
      setLoading(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-[80vh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="relative inline-flex mb-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Order Confirmed!
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Thank you for your purchase
          </p>

          {submittedOrderId && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
              <Package className="h-4 w-4 text-gray-400" />

              <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                {submittedOrderId}
              </span>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                  <Truck className="h-5 w-5" />
                </div>
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Order Status: Processing
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You&apos;ll receive a confirmation email shortly
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full h-2 w-1/4" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
            >
              <Package className="h-5 w-5" />
              Track Your Order
            </button>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-3.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
              <Lock className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Secure Checkout
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Complete your order securely
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-950/30 rounded-full text-sm font-semibold text-primary-700 dark:text-primary-400">
            <Package className="h-4 w-4" />
            Cart
          </div>

          <ChevronRight className="h-4 w-4 text-gray-300" />

          <div className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-semibold shadow-sm">
            <CreditCard className="h-4 w-4" />
            Checkout
          </div>

          <ChevronRight className="h-4 w-4 text-gray-300" />

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="h-4 w-4" />
            Confirmation
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Shipping Information
                      </h2>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter your delivery details
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          First Name
                        </span>
                      </label>

                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          Last Name
                        </span>
                      </label>

                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        Email Address
                      </span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        Phone Number
                      </span>
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-gray-400" />
                        Street Address
                      </span>
                    </label>

                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          City
                        </span>
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          Postal Code
                        </span>
                      </label>

                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      Secure Checkout
                    </p>

                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Your payment will be processed securely with Razorpay.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary-500" />
                      Order Summary
                    </h2>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {cartItems.length}{" "}
                      {cartItems.length === 1 ? "item" : "items"} in your order
                    </p>
                  </div>

                  <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {cartItems.map((item, index) => (
                        <div
                          key={`${item.productId || item.id || index}-${index}`}
                          className="flex items-center gap-3 group"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-14 w-14 rounded-xl object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {item.name}
                            </p>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>

                          <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal
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
                        {shipping === 0
                          ? "FREE"
                          : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax (8%)
                      </span>

                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{tax.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          Total
                        </span>

                        <div className="text-right">
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ₹{grandTotal.toFixed(2)}
                          </span>

                          <p className="text-[10px] text-gray-400">
                            INR • Includes all taxes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errorMsg}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    paymentOpening ||
                    !cartItems.length
                  }
                  className="w-full rounded-2xl bg-primary-600 py-4 font-bold text-white transition-all hover:bg-primary-700 active:scale-[0.99] shadow-xl shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                >
                  {loading || paymentOpening ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {paymentOpening
                        ? "Waiting for payment..."
                        : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Pay Now • ₹{grandTotal.toFixed(2)}
                    </>
                  )}
                </button>

                {!isLoggedIn && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                    <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Please sign in to place your order
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    SSL Secure
                  </div>

                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Protected
                  </div>

                  <div className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Fast Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;