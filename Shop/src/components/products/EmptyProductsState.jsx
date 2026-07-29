import React from 'react';
import { PackageOpen, RefreshCw, Server } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';

export const EmptyProductsState = ({ title, message }) => {
  const { refreshProducts, isLoading } = useProducts();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-12 text-center my-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400 mb-4">
        <PackageOpen className="h-8 w-8" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        {title || 'No Products Available'}
      </h3>

      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {message || 'The product catalog is currently blank and ready for your backend API data integration. Connect your backend API to automatically render live products here.'}
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => refreshProducts()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Fetching API...' : 'Fetch from Backend API'}
        </button>
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs font-mono text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        <Server className="h-4 w-4 text-emerald-500" />
        <span>Target Endpoint: GET /api/products</span>
      </div>
    </div>
  );
};
