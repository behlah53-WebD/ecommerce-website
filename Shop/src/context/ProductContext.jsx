import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useCategories, useBrands, useInvalidateProducts } from '../hooks/useQueries';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { currentUser, isAuthLoading } = useAuth();
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const invalidateProducts = useInvalidateProducts();

  const refreshProducts = useCallback(() => invalidateProducts(), [invalidateProducts]);
  const refreshShopProducts = useCallback(() => invalidateProducts(), [invalidateProducts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const hasActiveFilters = useMemo(
    () =>
      selectedCategory !== 'All' ||
      selectedBrands.length > 0 ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 1000 ||
      Boolean(searchQuery),
    [selectedCategory, selectedBrands, priceRange, searchQuery]
  );

  const buildShopFilters = useCallback(() => ({
    search: searchQuery.trim() || undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    sort: selectedSort !== 'featured' ? selectedSort : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
  }), [searchQuery, selectedCategory, selectedSort, priceRange, selectedBrands]);

  const value = useMemo(() => ({
    categories: ['All', ...categories.filter((c) => c !== 'All')],
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