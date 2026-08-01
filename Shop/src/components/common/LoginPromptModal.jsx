import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, X, ShoppingBag, Heart, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPromptModal = () => {
  const { isAuthModalOpen, authModalMessage, closeAuthModal, pendingAction } = useAuth();
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  const handleLoginClick = () => {
    closeAuthModal();
    navigate('/account');
  };

  const getActionIcon = () => {
    if (pendingAction?.type === 'cart') {
      return <ShoppingBag className="h-7 w-7 text-primary-600 dark:text-primary-400" />;
    }
    if (pendingAction?.type === 'wishlist') {
      return <Heart className="h-7 w-7 text-red-500" />;
    }
    return <ShieldAlert className="h-7 w-7 text-amber-500" />;
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center space-y-5">
        {}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/60 shadow-inner">
          {getActionIcon()}
        </div>

        {}
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
            {authModalMessage}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Sign in as a Buyer to sync your cart & wishlist securely.
          </p>
        </div>

        {}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={handleLoginClick}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 active:scale-[0.99] transition-all shadow-lg shadow-primary-500/25"
          >
            <LogIn className="h-4 w-4" />
            Log In / Sign Up
          </button>
          
          <button
            onClick={closeAuthModal}
            className="rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
