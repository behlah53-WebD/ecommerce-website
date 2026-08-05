import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { EmptyProductsState } from './EmptyProductsState';
import { useProducts } from '../../hooks/useProducts';
import { Loader2 } from 'lucide-react';

export const ProductGrid = () => {
  const { products, isLoading, hasMore, loadMoreProducts } = useProducts();

  if (isLoading && (!products || products.length === 0)) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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
    <InfiniteScroll
      dataLength={products.length}
      next={loadMoreProducts}
      hasMore={hasMore}
      hasChildren
      loader={
        <div className="flex flex-col items-center justify-center pt-4 pb-8">
          <div className="flex flex-col items-center gap-2.5 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Loading products...
            </span>
          </div>
        </div>
      }
      scrollThreshold="200px"
    >
      <div className="w-full grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </InfiniteScroll>
  );
};