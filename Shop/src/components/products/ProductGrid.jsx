import React, { useCallback, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { EmptyProductsState } from './EmptyProductsState';
import { Loader } from '../ui';

export const ProductGrid = ({
  products = [],
  isLoading = false,
  hasMore = false,
  loadMore,
  emptyTitle,
  emptyMessage,
  onRefresh,
  className = '',
  columns = { base: 2, sm: 3, lg: 4 },
  gap = { base: 3, sm: 4, lg: 6 },
}) => {
  const gridColumns = useMemo(
    () => `grid-cols-${columns.base} sm:grid-cols-${columns.sm} lg:grid-cols-${columns.lg}`,
    [columns.base, columns.sm, columns.lg]
  );

  const gridGap = useMemo(
    () => `gap-${gap.base} sm:gap-${gap.sm} lg:gap-${gap.lg}`,
    [gap.base, gap.sm, gap.lg]
  );

  const renderSkeletons = useCallback(() => (
    <div className={`w-full grid ${gridColumns} ${gridGap}`}>
      {Array.from({ length: 8 }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  ), [gridColumns, gridGap]);

  if (isLoading && (!products || products.length === 0)) {
    return renderSkeletons();
  }

  if (!products || products.length === 0) {
    return (
      <EmptyProductsState
        title={emptyTitle}
        message={emptyMessage}
        onRefresh={onRefresh}
        loading={isLoading}
      />
    );
  }

  return (
    <InfiniteScroll
      dataLength={products.length}
      next={loadMore}
      hasMore={hasMore}
      hasChildren
      style={{ overflow: 'visible' }}
      loader={
        <div className="flex flex-col items-center justify-center pt-4 pb-8">
          <div className="flex flex-col items-center gap-2.5 text-gray-500 dark:text-gray-400">
            <Loader size="lg" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Loading products...
            </span>
          </div>
        </div>
      }
      scrollThreshold="200px"
    >
      <div className={`w-full grid ${gridColumns} ${gridGap} ${className}`}>
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;