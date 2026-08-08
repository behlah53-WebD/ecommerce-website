import React from 'react';
import { ShoppingBag } from 'lucide-react';

export const OrderItemsList = ({ items }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
      <ShoppingBag className="h-3.5 w-3.5" />
      Items Ordered
    </h4>
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800/50 rounded-xl p-3">
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
            ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  </div>
);