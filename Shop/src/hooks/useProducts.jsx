import { useProductContext } from '../context/ProductContext';
import { useInfiniteProducts } from '../hooks/useQueries';

export const useProducts = () => {
  const {
    categories,
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
  } = useProductContext();

  const shopFilters = buildShopFilters();

  const {
    data: shopData,
    isLoading: shopLoading,
    error: shopError,
    fetchNextPage: loadMoreShopProducts,
    hasNextPage: shopHasMore,
    isFetchingNextPage: shopFetchingMore,
    refetch: refreshShopProducts,
  } = useInfiniteProducts({ ...shopFilters, limit: 8 });

  const shopProducts = shopData?.pages.flatMap(page => page.products) || [];

  const shopPagination = shopData?.pages[shopData.pages.length - 1]?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
  };

  return {
    categories,
    brands,
    categoriesLoading,
    brandsLoading,
    shopProducts,
    shopLoading,
    shopError,
    refreshShopProducts,
    loadMoreShopProducts,
    shopCurrentPage: shopPagination.currentPage,
    shopTotalPages: shopPagination.totalPages,
    shopTotalCount: shopPagination.totalRecords,
    shopHasMore,
    isShopFetchingMore: shopFetchingMore,

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
  };
};

export const useHomeProducts = () => {
  const {
    data: homeData,
    isLoading: homeLoading,
    error: homeError,
    fetchNextPage: loadMoreHomeProducts,
    hasNextPage: homeHasMore,
    isFetchingNextPage: homeFetchingMore,
    refetch: refreshHomeProducts,
  } = useInfiniteProducts({ limit: 8 });

  const homeProducts = homeData?.pages.flatMap(page => page.products) || [];

  const homePagination = homeData?.pages[homeData.pages.length - 1]?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
  };

  return {
    products: homeProducts,
    isLoading: homeLoading,
    error: homeError,
    refreshProducts: refreshHomeProducts,
    loadMoreProducts: loadMoreHomeProducts,
    currentPage: homePagination.currentPage,
    totalPages: homePagination.totalPages,
    totalCount: homePagination.totalRecords,
    hasMore: homeHasMore,
    isFetchingMore: homeFetchingMore,
  };
};