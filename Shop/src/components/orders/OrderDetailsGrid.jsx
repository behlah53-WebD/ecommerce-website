import React from 'react';
import { MapPin, CreditCard, FileText } from 'lucide-react';
import { Button } from '../ui';

export const OrderShippingAddress = ({ shippingAddress }) => (
  <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4">
    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
      <MapPin className="h-3.5 w-3.5" />
      Shipping Address
    </h4>
    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
      <p className="font-semibold">
        {shippingAddress?.firstName}{" "}
        {shippingAddress?.lastName}
      </p>
      <p>{shippingAddress?.address}</p>
      <p>
        {shippingAddress?.city},{" "}
        {shippingAddress?.postalCode}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {shippingAddress?.email}
      </p>
    </div>
  </div>
);

export const OrderPriceBreakdown = ({ order, onDownloadInvoice }) => (
  <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4">
    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
      <CreditCard className="h-3.5 w-3.5" />
      Price Breakdown
    </h4>
    <div className="text-sm space-y-2">
      <div className="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Subtotal</span>
        <span>₹{order.subtotal?.toFixed(2)}</span>
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
          {order.shipping === 0 ? "FREE" : `₹${order.shipping?.toFixed(2)}`}
        </span>
      </div>
      <div className="flex justify-between text-gray-600 dark:text-gray-400">
        <span>Tax</span>
        <span>₹{order.tax?.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
        <span>Total</span>
        <span className="text-primary-600 dark:text-primary-400">
          ₹{order.grandTotal?.toFixed(2)}
        </span>
      </div>
      <Button
        variant="primary"
        fullWidth
        leftIcon={<FileText className="h-4 w-4" />}
        onClick={() => onDownloadInvoice(order)}
        className="mt-3"
        size="sm"
      >
        Download Invoice (PDF)
      </Button>
    </div>
  </div>
);

export const OrderDetailsGrid = ({ order, onDownloadInvoice }) => (
  <div className="grid sm:grid-cols-2 gap-4">
    <OrderShippingAddress shippingAddress={order.shippingAddress} />
    <OrderPriceBreakdown order={order} onDownloadInvoice={onDownloadInvoice} />
  </div>
);