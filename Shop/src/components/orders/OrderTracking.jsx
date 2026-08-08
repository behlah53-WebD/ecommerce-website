import React from 'react';
import { 
  Clock, Truck, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Package 
} from 'lucide-react';

export const STATUS_ICON_COMPONENTS = {
  Pending: Clock,
  Processing: Clock,
  Shipped: Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
  "Cancellation Pending": AlertTriangle,
  "Return Pending": RotateCcw,
  Returned: Package,
};

const TRACKING_STEPS = [
  { key: "confirmed", label: "Order Confirmed", badge: "Processing" },
  { key: "shipped", label: "Order Shipped", badge: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery", badge: "Shipped" },
  { key: "delivered", label: "Order Delivered", badge: "Delivered" },
  { key: "return_requested", label: "Return Requested", badge: "Return Pending" },
  { key: "returned", label: "Returned", badge: "Returned" },
];

export const OrderTracking = ({ order, now, approved, currentStepIndex, visibleSteps, isCancelled, progressWidth }) => {
  if (isCancelled) return null;

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-5">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
        <Truck className="h-3.5 w-3.5" />
        Order Tracking
      </h4>

      <div className="relative px-1 sm:px-2">
        <div className="absolute top-4 left-[8%] right-[8%] h-0.5 bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute top-4 left-[8%] h-0.5 bg-emerald-500 transition-all duration-700 ease-out"
          style={{ width: progressWidth }}
        />

        <div className="relative flex justify-between">
          {visibleSteps.map((step, index) => {
            const isCompleted = approved && index <= currentStepIndex;
            const isCurrent = approved && index === currentStepIndex;
            const nodeWidth = visibleSteps.length === 6 ? "w-[16%]" : "w-[22%]";

            return (
              <div key={step.key} className={`flex flex-col items-center ${nodeWidth}`}>
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                  } ${isCurrent ? "ring-4 ring-emerald-500/20" : ""}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <p
                  className={`mt-2.5 text-[10px] sm:text-xs font-medium text-center leading-tight ${
                    isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {!approved && (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 text-center">
            The tracking started after order has been approved
          </p>
        </div>
      )}
    </div>
  );
};