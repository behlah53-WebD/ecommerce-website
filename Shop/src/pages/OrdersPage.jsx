import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Loader2,
  AlertCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Search,
  Filter,
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  MapPin,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";

const STATUS_COLORS = {
  Pending:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  Processing:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  Shipped:
    "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  Delivered:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  Cancelled:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  "Cancellation Pending":
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  "Return Pending":
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
};

const STATUS_ICONS = {
  Pending: Clock,
  Processing: Clock,
  Shipped: Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
  "Cancellation Pending": AlertTriangle,
  "Return Pending": RotateCcw,
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Determine the display status - Fixed logic
  const getDisplayStatus = () => {
    // Only show Cancellation Pending if cancel was actually requested and status is Pending
    if (
      order.cancelRequest?.requested === true &&
      order.cancelRequest?.status === "Pending"
    ) {
      return "Cancellation Pending";
    }
    // Only show Cancelled if cancel was approved
    if (
      order.cancelRequest?.requested === true &&
      order.cancelRequest?.status === "Approved"
    ) {
      return "Cancelled";
    }
    // Only show Return Pending if return was actually requested and status is Pending
    if (
      order.returnRequest?.requested === true &&
      order.returnRequest?.status === "Pending"
    ) {
      return "Return Pending";
    }
    // Otherwise show the actual order status, default to Pending
    return order.status || "Pending";
  };

  const displayStatus = getDisplayStatus();
  const StatusIcon = STATUS_ICONS[displayStatus] || Clock;

  const showToastMessage = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      4000,
    );
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      showToastMessage("Please provide a reason for cancellation", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await apiClient.post(
        `/orders/${order.orderId}/cancel-request`,
        { reason: cancelReason },
      );
      if (data.success) {
        showToastMessage(
          "Cancellation request submitted for admin approval",
          "success",
        );
        setShowCancelModal(false);
        setCancelReason("");
        window.location.reload();
      } else {
        showToastMessage(data.message || "Failed to submit request", "error");
      }
    } catch (err) {
      showToastMessage(
        err.response?.data?.message || "Failed to submit request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) {
      showToastMessage("Please provide a reason for return", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await apiClient.post(
        `/orders/${order.orderId}/return-request`,
        { reason: returnReason },
      );
      if (data.success) {
        showToastMessage(
          "Return request submitted for admin approval",
          "success",
        );
        setShowReturnModal(false);
        setReturnReason("");
        window.location.reload();
      } else {
        showToastMessage(data.message || "Failed to submit request", "error");
      }
    } catch (err) {
      showToastMessage(
        err.response?.data?.message || "Failed to submit request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Fixed cancel/return availability logic
  const canCancel =
    (order.status === "Pending" || order.status === "Processing") &&
    !order.cancelRequest?.requested &&
    !order.returnRequest?.requested;

  const canReturn =
    order.status === "Delivered" && !order.returnRequest?.requested;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header Row */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${STATUS_COLORS[displayStatus]?.split(" ")[0] || "bg-gray-100"} ${STATUS_COLORS[displayStatus]?.split(" ")[1] || "text-gray-600"}`}
            >
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                {order.orderId}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[displayStatus] || STATUS_COLORS.Pending}`}
            >
              <StatusIcon className="h-3 w-3" />
              {displayStatus}
            </span>
            <p className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">
              ${order.grandTotal?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {order.items?.length || 0}{" "}
            {order.items?.length === 1 ? "item" : "items"}
          </span>

          <div className="flex-1" />

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/50 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Order
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950/50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Return Order
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
          >
            {expanded ? "Hide Details" : "View Details"}
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Request Cancellation
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Order: {order.orderId}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Please provide a reason for cancelling this order. Your request
              will be reviewed by our team.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[80px] resize-none text-sm"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          onClick={() => setShowReturnModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Request Return
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Order: {order.orderId}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Please provide a reason for returning this order. Our team will
              review your request.
            </p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Reason for return..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px] resize-none text-sm"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnReason("");
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRequest}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="p-4 sm:p-6 space-y-5">
            {/* Items List */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5" />
                Items Ordered
              </h4>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800/50 rounded-xl p-3"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 rounded-xl object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Qty: {item.quantity}
                        {item.color && ` · ${item.color}`}
                        {item.size && ` · Size ${item.size}`}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Price Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Shipping Address
                </h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                  <p className="font-semibold">
                    {order.shippingAddress?.firstName}{" "}
                    {order.shippingAddress?.lastName}
                  </p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.postalCode}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.shippingAddress?.email}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5" />
                  Price Breakdown
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>${order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span
                      className={
                        order.shipping === 0
                          ? "text-emerald-600 font-semibold"
                          : ""
                      }
                    >
                      {order.shipping === 0
                        ? "FREE"
                        : `$${order.shipping?.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>${order.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span>Total</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      ${order.grandTotal?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Alerts */}
            {displayStatus === "Cancellation Pending" && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-orange-800 dark:text-orange-200 text-sm">
                    Cancellation Request Pending
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 truncate">
                    Reason: {order.cancelRequest.reason}
                  </p>
                </div>
              </div>
            )}
            {displayStatus === "Return Pending" && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                <RotateCcw className="h-5 w-5 text-purple-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-purple-800 dark:text-purple-200 text-sm">
                    Return Request Pending
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                    Reason: {order.returnRequest.reason}
                  </p>
                </div>
              </div>
            )}
            {order.cancelRequest?.requested &&
              order.cancelRequest?.status === "Approved" && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">
                    Cancellation Approved
                  </span>
                </div>
              )}
            {order.cancelRequest?.requested &&
              order.cancelRequest?.status === "Rejected" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <span className="font-semibold text-red-800 dark:text-red-200 text-sm">
                    Cancellation Rejected
                  </span>
                </div>
              )}
            {order.returnRequest?.requested &&
              order.returnRequest?.status === "Approved" && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">
                    Return Approved - Refund Processed
                  </span>
                </div>
              )}
            {order.returnRequest?.requested &&
              order.returnRequest?.status === "Rejected" && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <span className="font-semibold text-red-800 dark:text-red-200 text-sm">
                    Return Rejected
                  </span>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all animate-slideDown flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export const OrdersPage = () => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) {
      navigate("/account");
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get("/orders/my");
        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || "Failed to load orders.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, isAuthLoading, navigate]);

  // Fixed filter logic
  const getOrderDisplayStatus = (order) => {
    if (
      order.cancelRequest?.requested === true &&
      order.cancelRequest?.status === "Pending"
    )
      return "Cancellation Pending";
    if (
      order.cancelRequest?.requested === true &&
      order.cancelRequest?.status === "Approved"
    )
      return "Cancelled";
    if (
      order.returnRequest?.requested === true &&
      order.returnRequest?.status === "Pending"
    )
      return "Return Pending";
    return order.status || "Pending";
  };

  const filteredOrders = orders.filter((order) => {
    const displayStatus = getOrderDisplayStatus(order);
    const matchesStatus =
      filterStatus === "All" || displayStatus === filterStatus;
    const matchesSearch =
      !searchTerm ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Fixed status counts
  const statusCounts = {
    All: orders.length,
  };

  // Count each status
  orders.forEach((order) => {
    const displayStatus = getOrderDisplayStatus(order);
    statusCounts[displayStatus] = (statusCounts[displayStatus] || 0) + 1;
  });

  if (isAuthLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={() => navigate("/account")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Account
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 shadow-sm">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  My Orders
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {orders.length} {orders.length === 1 ? "order" : "orders"}{" "}
                  placed
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 text-sm text-red-600 dark:text-red-400 mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search and Filter Bar */}
        {orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === status
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                  }`}
                >
                  {status}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      filterStatus === status
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 && !error ? (
          <div className="text-center py-16 lg:py-20">
            <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-gray-100 dark:bg-gray-800 mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md mx-auto">
              When you place an order, it will appear here. Start shopping to
              see your orders.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
            >
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No orders match your filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id || order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
