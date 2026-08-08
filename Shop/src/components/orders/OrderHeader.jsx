import React from 'react';
import { ChevronDown, ChevronUp, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '../ui';

export const OrderActions = ({ 
  order, 
  displayStatus, 
  approved, 
  currentStepIndex,
  onCancelRequest,
  onReturnRequest,
  onToggleExpand,
  expanded,
  canCancel,
  canReturn,
  submitting
}) => {
  const itemCount = order.items?.length || 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>

      <div className="flex-1" />

      {canCancel && (
        <button
          onClick={onCancelRequest}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/50 transition-colors"
        >
          <XCircle className="h-3.5 w-3.5" />
          Cancel Order
        </button>
      )}
      {canReturn && (
        <button
          onClick={onReturnRequest}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950/50 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Return Order
        </button>
      )}
      <button
        onClick={onToggleExpand}
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
  );
};

export const OrderHeader = ({ order, displayStatus, STATUS_COLORS, STATUS_ICONS, date }) => {
  const bgColor = STATUS_COLORS[displayStatus]?.split(" ")[0] || "bg-gray-100";
  const textColor = STATUS_COLORS[displayStatus]?.split(" ")[1] || "text-gray-600";
  const StatusIcon = STATUS_ICONS[displayStatus] || React.createElement('span', null, '🕐');

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor} ${textColor}`}>
        <StatusIcon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
          {order.orderId}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span className="h-3 w-3">📅</span>
          {date}
        </p>
      </div>
    </div>
  );
};

export const OrderStatusBadge = ({ displayStatus, STATUS_COLORS, STATUS_ICONS }) => {
  const StatusIcon = STATUS_ICONS[displayStatus] || React.createElement('span', null, '🕐');
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[displayStatus] || STATUS_COLORS.Pending}`}>
      <StatusIcon className="h-3 w-3" />
      {displayStatus}
    </span>
  );
};

export const OrderTotal = ({ grandTotal }) => (
  <p className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">
    ₹{grandTotal?.toFixed(2)}
  </p>
);