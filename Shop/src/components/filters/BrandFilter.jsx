import React from 'react';
import { Filter, X } from 'lucide-react';

export const BrandFilter = ({
  brands = [],
  selectedBrands = [],
  onSelectBrand,
  onClearBrands,
  className = '',
  maxHeight = '64',
}) => {
  if (brands.length === 0) return null;

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary-500" />
          Brand
        </h3>
        {selectedBrands.length > 0 && (
          <button
            onClick={onClearBrands}
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      <div className={`max-h-${maxHeight} overflow-y-auto p-2`}>
        {brands.map((brand) => {
          const isChecked = selectedBrands.includes(brand);
          return (
            <label
              key={brand}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onSelectBrand(brand, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
              />
              <span className="truncate">{brand}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

BrandFilter.displayName = 'BrandFilter';

export default BrandFilter;