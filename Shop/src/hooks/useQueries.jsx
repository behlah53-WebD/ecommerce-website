import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProductById, getCategories, fetchBrands, getActiveShockingDealCached, clearShockingDealCache } from '../api/productService';

const PRODUCTS_KEY = 'products';
const PRODUCT_KEY = 'product';
const CATEGORIES_KEY = 'categories';
const BRANDS_KEY = 'brands';
const SHOCKING_DEAL_KEY = 'shockingDeal';

export const useProducts = (filters = {}, options = {}) => {
  const queryKey = [PRODUCTS_KEY, filters];
  
  return useQuery({
    queryKey,
    queryFn: () => getProducts(filters),
    ...options,
  });
};

export const useInfiniteProducts = (filters = {}) => {
  const queryKey = [PRODUCTS_KEY, 'infinite', filters];
  
  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return (lastPage.pagination?.currentPage || 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useProduct = (id, options = {}) => {
  return useQuery({
    queryKey: [PRODUCT_KEY, id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useBrands = (options = {}) => {
  return useQuery({
    queryKey: [BRANDS_KEY],
    queryFn: fetchBrands,
    staleTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useShockingDeal = (options = {}) => {
  return useQuery({
    queryKey: [SHOCKING_DEAL_KEY],
    queryFn: () => getActiveShockingDealCached(true),
    staleTime: 15000,
    retry: 4,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    ...options,
  });
};

export const useShockingDealProducts = (deal, options = {}) => {
  return useQuery({
    queryKey: [SHOCKING_DEAL_KEY, 'products', deal?.id],
    queryFn: async () => {
      if (!deal?.products?.length) return [];
      
      const productPromises = deal.products.map((item) => 
        getProductById(item.productId).catch(() => null)
      );
      const results = await Promise.all(productPromises);
      return results.filter(Boolean);
    },
    enabled: !!deal?.products?.length,
    staleTime: 15000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    ...options,
  });
};

export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY] });
  };
};

export const useClearShockingDealCache = () => {
  const queryClient = useQueryClient();
  
  return () => {
    clearShockingDealCache();
    queryClient.invalidateQueries({ queryKey: [SHOCKING_DEAL_KEY] });
  };
};