export const STATUS_COLORS = {
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
  Returned:
    "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
};

export const STATUS_ICONS = {
  Pending: 'Clock',
  Processing: 'Clock',
  Shipped: 'Truck',
  Delivered: 'CheckCircle2',
  Cancelled: 'XCircle',
  "Cancellation Pending": 'AlertTriangle',
  "Return Pending": 'RotateCcw',
  Returned: 'Package',
};

export const TRACKING_STEPS = [
  { key: "confirmed", label: "Order Confirmed", badge: "Processing" },
  { key: "shipped", label: "Order Shipped", badge: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery", badge: "Shipped" },
  { key: "delivered", label: "Order Delivered", badge: "Delivered" },
  { key: "return_requested", label: "Return Requested", badge: "Return Pending" },
  { key: "returned", label: "Returned", badge: "Returned" },
];

export const STEP_THRESHOLDS_MS = [
  0,
  1 * 60 * 1000,
  2 * 60 * 1000,
  3 * 60 * 1000,
];

export const isOrderApproved = (order) => {
  const status = String(order?.status ?? "Pending")
    .trim()
    .toLowerCase();
  return ["processing", "shipped", "delivered", "returned"].includes(status);
};

export const getTrackingStepIndex = (order, now) => {
  if (!isOrderApproved(order) || !order.approvedAt) {
    return -1;
  }

  const approvedTime = new Date(order.approvedAt).getTime();
  if (Number.isNaN(approvedTime)) return 0;

  const elapsed = now - approvedTime;
  let step = 0;
  for (let i = 0; i < STEP_THRESHOLDS_MS.length; i++) {
    if (elapsed >= STEP_THRESHOLDS_MS[i]) {
      step = i;
    } else {
      break;
    }
  }

  if (step >= 3 && order.returnRequest?.requested) {
    if (order.returnRequest?.status === "Pending") {
      return 4;
    }
    if (
      order.returnRequest?.status === "Approved" &&
      order.returnRequest?.processedAt
    ) {
      const processedTime = new Date(order.returnRequest.processedAt).getTime();
      if (Number.isNaN(processedTime) || now - processedTime >= 60000) {
        return 5;
      }
      return 4;
    }
  }

  return step;
};

export const resolveOrderStatus = (order, now) => {
  if (
    order.cancelRequest?.requested === true &&
    order.cancelRequest?.status === "Pending"
  ) {
    return "Cancellation Pending";
  }
  if (
    order.cancelRequest?.requested === true &&
    order.cancelRequest?.status === "Approved"
  ) {
    return "Cancelled";
  }
  if (
    order.returnRequest?.requested === true &&
    order.returnRequest?.status === "Approved"
  ) {
    return "Returned";
  }
  if (
    order.returnRequest?.requested === true &&
    order.returnRequest?.status === "Pending"
  ) {
    return "Return Pending";
  }

  const stepIndex = getTrackingStepIndex(order, now);
  if (stepIndex < 0) return "Pending";
  return TRACKING_STEPS[stepIndex]?.badge || "Pending";
};

export const getOrderDisplayStatus = (order, now) => resolveOrderStatus(order, now);

export const getProgressWidth = (order, now, visibleSteps) => {
  const approved = isOrderApproved(order);
  const currentStepIndex = getTrackingStepIndex(order, now);
  
  if (!approved || currentStepIndex < 0) return "0%";
  const totalSegments = visibleSteps.length - 1;
  const filledSegments = Math.min(currentStepIndex, visibleSteps.length - 1);
  if (filledSegments <= 0) return "0%";
  return `${(filledSegments / totalSegments) * 84}%`;
};

export const getVisibleSteps = (order) => {
  const hasReturnFlow = Boolean(order.returnRequest?.requested);
  return hasReturnFlow ? TRACKING_STEPS : TRACKING_STEPS.slice(0, 4);
};

export const canCancelOrder = (order, displayStatus) => {
  return (
    (displayStatus === "Pending" ||
      displayStatus === "Processing" ||
      displayStatus === "Shipped") &&
    !order.cancelRequest?.requested &&
    !order.returnRequest?.requested
  );
};

export const canReturnOrder = (order, approved, currentStepIndex, displayStatus) => {
  return (
    approved &&
    currentStepIndex >= 3 &&
    !order.returnRequest?.requested &&
    !order.cancelRequest?.requested &&
    order.status !== "Cancelled" &&
    order.status !== "Returned"
  );
};

export const isOrderCancelled = (displayStatus) => {
  return displayStatus === "Cancelled" || displayStatus === "Cancellation Pending";
};

export const formatOrderDate = (createdAt) => {
  return new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatOrderDateLong = (createdAt) => {
  return new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};