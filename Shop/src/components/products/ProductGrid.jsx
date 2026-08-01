import React from 'react';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { EmptyProductsState } from './EmptyProductsState';
import { useProducts } from '../../hooks/useProducts';
import { ChevronDown, Loader2 } from 'lucide-react';

export const ProductGrid = () => {
  const { products, isLoading, hasMore, loadMoreProducts } = useProducts();

  
  if (isLoading && (!products || products.length === 0)) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <EmptyProductsState />;
  }

  return (
    <div className="flex flex-col items-center gap-12">
      {}
      <div className="w-full grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>

      {}
      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-4 pb-8">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2.5 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Loading products...
              </span>
            </div>
          ) : (
            <button
              onClick={loadMoreProducts}
              className="group flex items-center gap-2.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-7 py-3.5 text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-300 hover:border-primary-500 hover:text-primary-600 hover:shadow-md active:scale-95 cursor-pointer"
            >
              <span>Show More Products</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5 text-gray-400 group-hover:text-primary-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};