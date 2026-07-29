import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, ShoppingBag, Loader2, AlertCircle, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const STATUS_COLORS = {
  Processing: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  Shipped: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  Cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToastMessage = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      showToastMessage('Please provide a reason for cancellation', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await apiClient.post(`/orders/${order.orderId}/cancel-request`, { reason: cancelReason });
      if (data.success) {
        showToastMessage('Cancellation request submitted for admin approval', 'success');
        setShowCancelModal(false);
        setCancelReason('');
        // Refresh orders
        window.location.reload();
      } else {
        showToastMessage(data.message || 'Failed to submit request', 'error');
      }
    } catch (err) {
      showToastMessage(err.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) {
      showToastMessage('Please provide a reason for return', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await apiClient.post(`/orders/${order.orderId}/return-request`, { reason: returnReason });
      if (data.success) {
        showToastMessage('Return request submitted for admin approval', 'success');
        setShowReturnModal(false);
        setReturnReason('');
        window.location.reload();
      } else {
        showToastMessage(data.message || 'Failed to submit request', 'error');
      }
    } catch (err) {
      showToastMessage(err.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const canCancel = ['Processing', 'Shipped'].includes(order.status) && !order.cancelRequest?.requested;
  const canReturn = order.status === 'Delivered' && !order.returnRequest?.requested;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
          <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{order.orderId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Placed On</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{date}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
            ${order.grandTotal?.toFixed(2)}
          </p>
        </div>
        <div>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status] || STATUS_COLORS.Processing}`}>
            {order.status}
            {order.cancelRequest?.status === 'Pending' && <span className="ml-1">(Cancel Pending)</span>}
            {order.returnRequest?.status === 'Pending' && <span className="ml-1">(Return Pending)</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Return
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            {expanded ? 'Hide details' : 'View details'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Request Order Cancellation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Please provide a reason for cancelling this order.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px] resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Request Return</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Please provide a reason for returning this order.</p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Reason for return..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px] resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowReturnModal(false); setReturnReason(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRequest}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 space-y-4">
          {/* Items */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Items Ordered
            </h4>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-xl object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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

          {/* Shipping address + pricing */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Shipping Address
              </h4>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                <p className="font-semibold">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                </p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{order.shippingAddress?.email}</p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Price Breakdown
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping?.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>${order.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">${order.grandTotal?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Show pending requests in expanded view */}
          {order.cancelRequest?.requested && order.cancelRequest.status === 'Pending' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-800 dark:text-amber-200">Cancellation Request Pending</span>
                </div>
                <span className="text-xs text-amber-600">Reason: {order.cancelRequest.reason}</span>
              </div>
            </div>
          )}
          {order.returnRequest?.requested && order.returnRequest.status === 'Pending' && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800 dark:text-purple-200">Return Request Pending</span>
                </div>
                <span className="text-xs text-purple-600">Reason: {order.returnRequest.reason}</span>
              </div>
            </div>
          )}
          {order.cancelRequest?.status === 'Approved' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="font-semibold text-green-800 dark:text-green-200">Cancellation Approved</span>
            </div>
          )}
          {order.cancelRequest?.status === 'Rejected' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="font-semibold text-red-800 dark:text-red-200">Cancellation Rejected</span>
            </div>
          )}
          {order.returnRequest?.status === 'Approved' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="font-semibold text-green-800 dark:text-green-200">Return Approved - Refund Processed</span>
            </div>
          )}
          {order.returnRequest?.status === 'Rejected' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="font-semibold text-red-800 dark:text-red-200">Return Rejected</span>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) {
      navigate('/account');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get('/orders/my');
        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || 'Failed to load orders.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, isAuthLoading, navigate]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
            My Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 text-sm text-red-600 dark:text-red-400 mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="text-center py-20">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-5">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            When you place an order, it will appear here.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id || order.orderId} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
