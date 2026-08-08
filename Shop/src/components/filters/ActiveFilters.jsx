import React from 'react';
import { X } from 'lucide-react';
import { ALL_CATEGORY, DEFAULT_PRICE_RANGE } from '../../constants';
import { formatPriceRange } from '../../utils/formatPrice';

export const ActiveFilters = ({
  filters = {},
  onRemoveFilter,
  className = '',
}) => {
  const {
    selectedCategory,
    selectedSort,
    priceRange,
    selectedBrands,
    searchQuery,
    hasActiveFilters,
  } = filters;

  if (!hasActiveFilters) {
    return (
      <span className="text-xs text-gray-400">No active filters</span>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {selectedCategory !== ALL_CATEGORY && (
        <>
          <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
            {selectedCategory}
            <button
              onClick={() => onRemoveFilter('category')}
              aria-label="Remove category filter"
            >
              <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
            </button>
          </span>
        </>
      )}

      {selectedSort !== 'featured' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
          Sort: {selectedSort}
          <button
            onClick={() => onRemoveFilter('sort')}
            aria-label="Clear sorting"
          >
            <X className="h-3 w-3 hover:text-gray-900 dark:hover:text-white" />
          </button>
        </span>
      )}

      {(priceRange[0] !== DEFAULT_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_PRICE_RANGE[1]) && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
          Price: {formatPriceRange(priceRange[0], priceRange[1])}
          <button
            onClick={() => onRemoveFilter('price')}
            aria-label="Clear price filter"
          >
            <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
          </button>
        </span>
      )}

      {selectedBrands.length > 0 &&
        selectedBrands.map((brand) => (
          <span key={brand} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
            {brand}
            <button
              onClick={() => onRemoveFilter('brand', brand)}
              aria-label={`Remove ${brand} filter`}
            >
              <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
            </button>
          </span>
        ))}
    </div>
  );
};

ActiveFilters.displayName = 'ActiveFilters';

export default ActiveFilters;