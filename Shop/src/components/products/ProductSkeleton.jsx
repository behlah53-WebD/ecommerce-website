import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-[3/4] overflow-hidden rounded-xl animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 bg-[length:200%_100%]" />
      
      <div className="mt-3 px-1 space-y-3">
        <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};
