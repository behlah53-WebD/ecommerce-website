import React, { useState } from 'react';
import { XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '../ui';

export const CancelModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onSubmit, 
  submitting 
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
      onClick={onClose}
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
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation..."
          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[80px] resize-none text-sm"
          rows={4}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => { onClose(); setReason(""); }}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => onSubmit(reason)}
            disabled={submitting || !reason.trim()}
            leftIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ReturnModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onSubmit, 
  submitting 
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
      onClick={onClose}
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
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for return..."
          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px] resize-none text-sm"
          rows={4}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => { onClose(); setReason(""); }}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => onSubmit(reason)}
            disabled={submitting || !reason.trim()}
            leftIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </div>
  );
};