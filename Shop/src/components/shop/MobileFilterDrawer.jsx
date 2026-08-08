import React from 'react';
import { Search, X, SlidersHorizontal, Filter, ChevronDown } from 'lucide-react';
import { PriceRangeSlider } from '../filters/PriceRangeSlider';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON, ALL_CATEGORY } from '../../constants';

export const MobileFilterDrawer = ({
  showMobileFilter,
  setShowMobileFilter,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOptions,
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  brands,
  selectedBrands,
  setSelectedBrands,
  toggleBrand,
}) => {
  if (!showMobileFilter) return null;

  const backendCategories = (categories || []).filter((cat) => cat !== ALL_CATEGORY);

  const getCategoryIcon = (catName) => {
    const key = String(catName || "").trim().toLowerCase();
    return CATEGORY_ICONS[key] || DEFAULT_CATEGORY_ICON;
  };

  return (
    <div className="fixed inset-0 z-[10000] lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowMobileFilter(false)}
      />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl animate-slideInRight overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <button
            onClick={() => setShowMobileFilter(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Mobile Sort */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Categories */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary-500" />
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory(ALL_CATEGORY);
                  setShowMobileFilter(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === ALL_CATEGORY
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🛍️</span>
                  All Products
                </span>
              </button>
              {backendCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowMobileFilter(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Price */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Price Range</label>
            <PriceRangeSlider
              min={0}
              max={1000}
              value={priceRange}
              onCommit={(range) => setPriceRange(range)}
            />
          </div>

          {/* Mobile Brand */}
          {brands.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Brand</label>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {brands.map((brand) => {
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <label key={brand} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleBrand(brand, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="truncate">{brand}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4">
          <button
            onClick={() => setShowMobileFilter(false)}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};