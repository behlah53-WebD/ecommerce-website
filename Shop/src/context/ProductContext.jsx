import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useCategories, useBrands, useInvalidateProducts } from '../hooks/useQueries';
import { useAuth } from './AuthContext';
import { DEFAULT_SORT, ALL_CATEGORY, DEFAULT_PRICE_RANGE } from '../constants';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { currentUser, isAuthLoading } = useAuth();
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const invalidateProducts = useInvalidateProducts();

  const refreshProducts = useCallback(() => invalidateProducts(), [invalidateProducts]);
  const refreshShopProducts = useCallback(() => invalidateProducts(), [invalidateProducts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [selectedSort, setSelectedSort] = useState(DEFAULT_SORT);
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const toggleBrand = useCallback((brand, checked) => {
    setSelectedBrands(prev => {
      if (checked) {
        return [...prev, brand];
      } else {
        return prev.filter(b => b !== brand);
      }
    });
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      selectedCategory !== ALL_CATEGORY ||
      selectedBrands.length > 0 ||
      priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
      priceRange[1] !== DEFAULT_PRICE_RANGE[1] ||
      Boolean(searchQuery),
    [selectedCategory, selectedBrands, priceRange, searchQuery]
  );

  const buildShopFilters = useCallback(() => ({
    search: searchQuery.trim() || undefined,
    category: selectedCategory !== ALL_CATEGORY ? selectedCategory : undefined,
    sort: selectedSort !== DEFAULT_SORT ? selectedSort : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
  }), [searchQuery, selectedCategory, selectedSort, priceRange, selectedBrands]);

  const value = useMemo(() => ({
    categories: [ALL_CATEGORY, ...categories.filter((c) => c !== ALL_CATEGORY)],
    brands,
    categoriesLoading,
    brandsLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    priceRange,
    setPriceRange,
    selectedBrands,
    setSelectedBrands,
    toggleBrand,
    hasActiveFilters,
    buildShopFilters,
    refreshProducts,
    refreshShopProducts,
  }), [
    categories,
    brands,
    categoriesLoading,
    brandsLoading,
    searchQuery,
    selectedCategory,
    selectedSort,
    priceRange,
    selectedBrands,
    hasActiveFilters,
    buildShopFilters,
    refreshProducts,
    refreshShopProducts,
    toggleBrand,
  ]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};