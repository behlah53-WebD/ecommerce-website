import React from 'react';

export const Loader = ({
  size = 'md',
  color = 'primary',
  className = '',
  ariaLabel = 'Loading',
}) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  const colors = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-t-2 ${colors[color]}`}
        aria-hidden="true"
      />
    </div>
  );
};

export const LoaderOverlay = ({
  isVisible,
  message = 'Loading...',
  className = '',
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm ${className}`}
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader size="lg" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {message}
        </span>
      </div>
    </div>
  );
};

export const InlineLoader = ({ size = 'sm', className = '' }) => (
  <Loader size={size} className={className} />
);