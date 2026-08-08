import React from 'react';
import { XCircle, AlertCircle, CheckCircle2, RotateCcw, Clock, Truck, Package } from 'lucide-react';
import { OrderHeader, OrderActions, OrderStatusBadge, OrderTotal } from './OrderHeader';
import { OrderItemsList } from './OrderItemsList';
import { OrderDetailsGrid } from './OrderDetailsGrid';
import { OrderStatusAlerts } from './OrderStatusAlerts';
import { CancelModal, ReturnModal } from './OrderModals';
import {
  STATUS_COLORS,
  STATUS_ICONS,
  resolveOrderStatus,
  getTrackingStepIndex,
  isOrderApproved,
  getVisibleSteps,
  canCancelOrder,
  canReturnOrder,
  isOrderCancelled,
  formatOrderDate,
  getProgressWidth,
} from '../../utils/orderTracking';
import { handleDownloadInvoice } from '../../utils/invoiceGenerator';
import { OrderTracking, STATUS_ICON_COMPONENTS } from './OrderTracking';
import { Button } from '../ui';

const getStatusIcon = (displayStatus) => {
  const IconComponent = STATUS_ICON_COMPONENTS[displayStatus] || Clock;
  return <IconComponent className="h-5 w-5" />;
};

export const OrderCard = ({ order, onRefresh }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showReturnModal, setShowReturnModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState({ show: false, message: "", type: "info" });
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const approved = isOrderApproved(order);
  const currentStepIndex = getTrackingStepIndex(order, now);
  const visibleSteps = getVisibleSteps(order);
  const displayStatus = resolveOrderStatus(order, now);
  const progressWidth = getProgressWidth(order, now, visibleSteps);
  const date = formatOrderDate(order.createdAt);

  const canCancel = canCancelOrder(order, displayStatus);
  const canReturn = canReturnOrder(order, approved, currentStepIndex, displayStatus);
  const isCancelled = isOrderCancelled(displayStatus);

  const showToastMessage = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 4000);
  };

  const handleCancelRequest = async (reason) => {
    if (!reason.trim()) {
      showToastMessage("Please provide a reason for cancellation", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await (await import('../../api/apiClient')).default.post(
        `/orders/${order.orderId}/cancel-request`,
        { reason },
      );
      if (data.success) {
        showToastMessage("Cancellation request submitted for admin approval", "success");
        setShowCancelModal(false);
        if (onRefresh) onRefresh();
      } else {
        showToastMessage(data.message || "Failed to submit request", "error");
      }
    } catch (err) {
      showToastMessage(err.response?.data?.message || "Failed to submit request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnRequest = async (reason) => {
    if (!reason.trim()) {
      showToastMessage("Please provide a reason for return", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await (await import('../../api/apiClient')).default.post(
        `/orders/${order.orderId}/return-request`,
        { reason },
      );
      if (data.success) {
        showToastMessage("Return request submitted for admin approval", "success");
        setShowReturnModal(false);
        if (onRefresh) onRefresh();
      } else {
        showToastMessage(data.message || "Failed to submit request", "error");
      }
    } catch (err) {
      showToastMessage(err.response?.data?.message || "Failed to submit request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <OrderHeader
            order={order}
            displayStatus={displayStatus}
            STATUS_COLORS={STATUS_COLORS}
            STATUS_ICONS={STATUS_ICON_COMPONENTS}
            date={date}
          />
          <div className="flex items-center gap-2 sm:gap-3">
            <OrderStatusBadge displayStatus={displayStatus} STATUS_COLORS={STATUS_COLORS} STATUS_ICONS={STATUS_ICON_COMPONENTS} />
            <OrderTotal grandTotal={order.grandTotal} />
          </div>
        </div>

        <OrderActions
          order={order}
          displayStatus={displayStatus}
          approved={approved}
          currentStepIndex={currentStepIndex}
          onCancelRequest={() => setShowCancelModal(true)}
          onReturnRequest={() => setShowReturnModal(true)}
          onToggleExpand={() => setExpanded((v) => !v)}
          expanded={expanded}
          canCancel={canCancel}
          canReturn={canReturn}
          submitting={submitting}
        />
      </div>

      <CancelModal
        order={order}
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSubmit={handleCancelRequest}
        submitting={submitting}
      />
      <ReturnModal
        order={order}
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onSubmit={handleReturnRequest}
        submitting={submitting}
      />

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="p-4 sm:p-6 space-y-5">
            <OrderTracking
              order={order}
              now={now}
              approved={approved}
              currentStepIndex={currentStepIndex}
              visibleSteps={visibleSteps}
              isCancelled={isCancelled}
              progressWidth={progressWidth}
            />
            <OrderItemsList items={order.items} />
            <OrderDetailsGrid order={order} onDownloadInvoice={handleDownloadInvoice} />
            <OrderStatusAlerts order={order} displayStatus={displayStatus} />
          </div>
        </div>
      )}

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