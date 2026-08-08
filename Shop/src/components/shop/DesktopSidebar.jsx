import React, { useMemo, useCallback } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { CategoryFilter } from '../filters/CategoryFilter';
import { PriceRangeSlider } from '../filters/PriceRangeSlider';
import { BrandFilter } from '../filters/BrandFilter';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON, ALL_CATEGORY, DEFAULT_PRICE_RANGE } from '../../constants';

export const DesktopSidebar = ({
  searchTerm,
  setSearchTerm,
  categories,
  selectedCategory,
  setSelectedCategory,
  shopTotalCount,
  priceRange,
  setPriceRange,
  brands,
  selectedBrands,
  setSelectedBrands,
  toggleBrand,
  showAllCategories,
  setShowAllCategories,
}) => {
  const backendCategories = (categories || []).filter((cat) => cat !== ALL_CATEGORY);

  const getCategoryIcon = useCallback((catName) => {
    const key = String(catName || "").trim().toLowerCase();
    return CATEGORY_ICONS[key] || DEFAULT_CATEGORY_ICON;
  }, []);

  const displayedCategories = useMemo(
    () => (showAllCategories ? backendCategories : backendCategories.slice(0, 6)),
    [backendCategories, showAllCategories]
  );

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="h-full overflow-y-auto space-y-5">
        {/* Search */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories */}
        <CategoryFilter
          categories={backendCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showAllCategories={showAllCategories}
          setShowAllCategories={setShowAllCategories}
          maxVisible={6}
          allCategoryLabel="All Products"
          allCategoryIcon="🛍️"
          allCategoryCount={shopTotalCount}
          getCategoryIcon={getCategoryIcon}
          allCategory={ALL_CATEGORY}
        />

        {/* Price Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary-500" />
              Price Range
            </h3>
          </div>
          <div className="p-4">
            <PriceRangeSlider
              min={0}
              max={1000}
              value={priceRange}
              onCommit={(range) => setPriceRange(range)}
            />
          </div>
        </div>

        {/* Brand Filter */}
        <BrandFilter
          brands={brands}
          selectedBrands={selectedBrands}
          onSelectBrand={toggleBrand}
          onClearBrands={() => setSelectedBrands([])}
        />

        {/* Help Card */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-5 w-5 text-primary-600 dark:text-primary-400">✨</span>
            <h4 className="text-sm font-bold text-primary-900 dark:text-primary-100">
              Need Help?
            </h4>
          </div>
          <p className="text-xs text-primary-700 dark:text-primary-300 mb-3">
            Can't find what you're looking for? Our support team is here
            to help.
          </p>
          <button className="w-full py-2 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-semibold border border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
};