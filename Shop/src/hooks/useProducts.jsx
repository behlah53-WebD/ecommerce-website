import { useProductContext } from '../context/ProductContext';

export const useProducts = () => {
  const {
    products,
    categories,
    isLoading,
    error,
    refreshProducts,
    loadMoreProducts,
    currentPage,
    totalPages,
    totalCount,
    hasMore,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    priceRange,
    setPriceRange,
  } = useProductContext();

  return {
    products,
    rawProducts: products,
    categories,
    totalCount,
    isLoading,
    error,
    refreshProducts,
    loadMoreProducts,
    currentPage,
    totalPages,
    hasMore,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    priceRange,
    setPriceRange,
  };
};

