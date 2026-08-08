import React from 'react';
import { X, ChevronDown, Grid3X3, ArrowLeft, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../products/ProductCard';
import { ProductSkeleton } from '../products/ProductSkeleton';
import { EmptyProductsState } from '../products/EmptyProductsState';
import { ActiveFilters } from '../filters/ActiveFilters';
import { SORT_OPTIONS, ALL_CATEGORY, DEFAULT_PRICE_RANGE } from '../../constants';

export const ShopHeader = ({
  selectedCategory,
  setSelectedCategory,
  shopTotalCount,
  ALL_CATEGORY,
  sortBy,
  setSortBy,
  setShowMobileFilter,
  SORT_OPTIONS,
}) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        {selectedCategory !== ALL_CATEGORY && (
          <Link
            to="/shop"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
          {selectedCategory === ALL_CATEGORY ? "All Products" : selectedCategory}
        </h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {shopTotalCount} {shopTotalCount === 1 ? "product" : "products"}{" "}
        available
      </p>
    </div>

    <div className="flex items-center gap-3">
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      <button
        onClick={() => setShowMobileFilter(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filters
      </button>
    </div>
  </div>
);

export const ActiveFiltersBar = ({
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  selectedBrands,
  setSelectedBrands,
  hasActiveFilters,
  ALL_CATEGORY,
  DEFAULT_PRICE_RANGE,
}) => (
  <div className="flex flex-wrap items-center gap-2 mb-4">
    {selectedCategory !== ALL_CATEGORY && (
      <>
        <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
          {selectedCategory}
          <button
            onClick={() => setSelectedCategory(ALL_CATEGORY)}
            aria-label="Remove category filter"
          >
            <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
          </button>
        </span>
      </>
    )}

    {sortBy !== "featured" && (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
        Sort: {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
        <button
          onClick={() => setSortBy("featured")}
          aria-label="Clear sorting"
        >
          <X className="h-3 w-3 hover:text-gray-900 dark:hover:text-white" />
        </button>
      </span>
    )}

    {(priceRange[0] !== DEFAULT_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_PRICE_RANGE[1]) && (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
        Price: ₹{priceRange[0]} - ₹{priceRange[1]}
        <button
          onClick={() => setPriceRange(DEFAULT_PRICE_RANGE)}
          aria-label="Clear price filter"
        >
          <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
        </button>
      </span>
    )}

    {selectedBrands.length > 0 &&
      selectedBrands.map((brand) => (
        <span
          key={brand}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium"
        >
          {brand}
          <button
            onClick={() =>
              setSelectedBrands(selectedBrands.filter((b) => b !== brand))
            }
            aria-label={`Remove ${brand} filter`}
          >
            <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
          </button>
        </span>
      ))}

    {!hasActiveFilters && <span className="text-xs text-gray-400">No active filters</span>}
  </div>
);

export const ResultsCount = ({
  shopTotalCount,
  sortBy,
  SORT_OPTIONS,
}) => (
  <div className="flex items-center justify-between mb-4">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Showing{" "}
      <span className="font-semibold text-gray-900 dark:text-white">
        {shopTotalCount}
      </span>{" "}
      results
      {sortBy !== "featured" && (
        <span className="ml-1">
          • Sorted by{" "}
          {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label.toLowerCase()}
        </span>
      )}
    </p>
    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
      <Grid3X3 className="h-3.5 w-3.5" />
      <span>Grid View</span>
    </div>
  </div>
);

export const ProductsDisplay = ({
  shopLoading,
  isShopFetchingMore,
  sortedProducts,
  shopTotalCount,
  hasActiveFilters,
  shopHasMore,
  loadMoreShopProducts,
  sentinelRef,
  refreshShopProducts,
}) => {
  if (shopLoading && (!sortedProducts || sortedProducts.length === 0)) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!sortedProducts || sortedProducts.length === 0) {
    return (
      <EmptyProductsState
        title={
          hasActiveFilters
            ? "No products match your filters"
            : "No Products Available"
        }
        message={
          hasActiveFilters
            ? "Try adjusting or clearing your filters to see more products."
            : "The product catalog is currently blank and ready for your backend API data integration."
        }
        onRefresh={refreshShopProducts}
        loading={shopLoading}
        useShop={true}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>

      {shopHasMore && (
        <div className="flex flex-col items-center justify-center pt-2 pb-6" ref={sentinelRef}>
          {(shopLoading || isShopFetchingMore) ? (
            <div key="loading-spinner" className="flex flex-col items-center gap-2.5 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Loading products...
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};