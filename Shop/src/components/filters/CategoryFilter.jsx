import React, { useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { ALL_CATEGORY, CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '../../constants';

export const CategoryFilter = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  showAllCategories = false,
  setShowAllCategories,
  maxVisible = 6,
  className = '',
}) => {
  const displayedCategories = useMemo(
    () => (showAllCategories ? categories : categories.slice(0, maxVisible)),
    [categories, showAllCategories, maxVisible]
  );

  const categoryIcons = CATEGORY_ICONS;

  const getCategoryIcon = useCallback((catName) => {
    const key = String(catName || '').trim().toLowerCase();
    return categoryIcons[key] || DEFAULT_CATEGORY_ICON;
  }, [categoryIcons]);

  return (
    <div className={`${className}`}>
      <button
         onClick={() => onSelectCategory(ALL_CATEGORY)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
           selectedCategory === ALL_CATEGORY
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">🛍️</span>
          All Products
        </span>
      </button>

      {displayedCategories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            selectedCategory === category
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{getCategoryIcon(category)}</span>
            {category}
          </span>
        </button>
      ))}

      {categories.length > maxVisible && (
        <button
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mt-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl transition-colors"
        >
          {showAllCategories ? (
            <>
              Show Less
              <ChevronDown className="h-3.5 w-3.5 rotate-180" />
            </>
          ) : (
            <>
              Show All ({categories.length})
              <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;