import React, { useMemo } from 'react';

export const ProductSkeleton = React.memo(() => {
  // Memoized skeleton animation style to prevent re-renders
  const skeletonStyle = useMemo(() => ({
    animation: 'pulse 1.5s ease-in-out infinite',
  }), []);

  return (
    <div 
      className="animate-pulse rounded-2xl bg-white p-3 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
      style={skeletonStyle}
    >
      <div className="aspect-[3/4] w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
      <div className="mt-3 space-y-2 px-1">
        <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
});
