import React from 'react';
import { AlertTriangle, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

const StatusAlert = ({ title, reason, icon: Icon, bgClass, iconColor, textColor, borderColor }) => (
  <div className={`flex items-center gap-3 p-4 ${bgClass} border ${borderColor} rounded-xl`}>
    <Icon className={`h-5 w-5 ${iconColor} shrink-0`} />
    <div className="flex-1 min-w-0">
      <p className={`font-semibold ${textColor} text-sm`}>{title}</p>
      <p className={`text-xs ${textColor.replace('800', '600').replace('200', '400')} mt-0.5 truncate`}>
        Reason: {reason}
      </p>
    </div>
  </div>
);

export const OrderStatusAlerts = ({ order, displayStatus }) => (
  <>
    {displayStatus === "Cancellation Pending" && (
      <StatusAlert
        title="Cancellation Request Pending"
        reason={order.cancelRequest?.reason}
        icon={AlertTriangle}
        bgClass="bg-orange-50 dark:bg-orange-900/20"
        iconColor="text-orange-600"
        textColor="text-orange-800 dark:text-orange-200"
        borderColor="border-orange-200 dark:border-orange-800"
      />
    )}
    {displayStatus === "Return Pending" && (
      <StatusAlert
        title="Return Request Pending"
        reason={order.returnRequest?.reason}
        icon={RotateCcw}
        bgClass="bg-purple-50 dark:bg-purple-900/20"
        iconColor="text-purple-600"
        textColor="text-purple-800 dark:text-purple-200"
        borderColor="border-purple-200 dark:border-purple-800"
      />
    )}
    {order.cancelRequest?.requested && order.cancelRequest?.status === "Approved" && (
      <StatusAlert
        title="Cancellation Approved"
        reason=""
        icon={CheckCircle2}
        bgClass="bg-emerald-50 dark:bg-emerald-900/20"
        iconColor="text-emerald-600"
        textColor="text-emerald-800 dark:text-emerald-200"
        borderColor="border-emerald-200 dark:border-emerald-800"
      />
    )}
    {order.cancelRequest?.requested && order.cancelRequest?.status === "Rejected" && (
      <StatusAlert
        title="Cancellation Rejected"
        reason=""
        icon={XCircle}
        bgClass="bg-red-50 dark:bg-red-900/20"
        iconColor="text-red-600"
        textColor="text-red-800 dark:text-red-200"
        borderColor="border-red-200 dark:border-red-800"
      />
    )}
    {order.returnRequest?.requested && order.returnRequest?.status === "Approved" && (
      <StatusAlert
        title="Return Approved - Refund Processed"
        reason=""
        icon={CheckCircle2}
        bgClass="bg-emerald-50 dark:bg-emerald-900/20"
        iconColor="text-emerald-600"
        textColor="text-emerald-800 dark:text-emerald-200"
        borderColor="border-emerald-200 dark:border-emerald-800"
      />
    )}
    {order.returnRequest?.requested && order.returnRequest?.status === "Rejected" && (
      <StatusAlert
        title="Return Rejected"
        reason=""
        icon={XCircle}
        bgClass="bg-red-50 dark:bg-red-900/20"
        iconColor="text-red-600"
        textColor="text-red-800 dark:text-red-200"
        borderColor="border-red-200 dark:border-red-800"
      />
    )}
  </>
);