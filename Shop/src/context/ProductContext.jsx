import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProducts, getCategories, fetchBrands } from '../api/productService';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { currentUser, isAuthLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Home page products ("Featured Products") - fetched unfiltered so shop filters never alter them
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Shop page product list - isolated from the home page `products` so applying
  // a filter in the shop never customizes the home page product list.
  const [shopProducts, setShopProducts] = useState([]);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState(null);
  const [shopCurrentPage, setShopCurrentPage] = useState(1);
  const [shopTotalPages, setShopTotalPages] = useState(1);
  const [shopTotalCount, setShopTotalCount] = useState(0);
  const [shopHasMore, setShopHasMore] = useState(false);

  // Filter state is kept in the context so that CategoryGrid / SearchModal can
  // set the active filter before navigating to the shop page.
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(['All', ...cats.filter((c) => c !== 'All')]);
    } catch (err) {
      console.warn('Failed to load categories', err);
      setCategories(['All', 'Clothing', 'Accessories', 'Footwear', 'Watches', 'Jewelry']);
    }
  };

  const loadBrands = async () => {
    try {
      const brs = await fetchBrands();
      setBrands(brs);
    } catch (err) {
      console.warn('Failed to load brands', err);
      setBrands([]);
    }
  };

  const buildShopFilters = () => ({
    search: searchQuery.trim() || undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    sort: selectedSort !== 'featured' ? selectedSort : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
  });

  // Home page: fetch all products (unfiltered). Not affected by shop filters.
  const fetchProductsList = async (page = 1, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
       const result = await getProducts({ page, limit: 8 });
      const newProducts = result.products || [];
      const pg = result.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0, hasNextPage: false };

      if (append) {
        setProducts((prev) => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setCurrentPage(pg.currentPage);
      setTotalPages(pg.totalPages);
      setTotalCount(pg.totalRecords);
      setHasMore(pg.hasNextPage);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      if (!append) {
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Shop page: fetch filtered products into a separate list so the home page
  // `products` are never replaced by a shop filter selection.
  const fetchShopProducts = async (page = 1, append = false) => {
    setShopLoading(true);
    setShopError(null);
    try {
       const result = await getProducts({ page, limit: 8, ...buildShopFilters() });
      const newProducts = result.products || [];
      const pg = result.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0, hasNextPage: false };

      if (append) {
        setShopProducts((prev) => [...prev, ...newProducts]);
      } else {
        setShopProducts(newProducts);
      }

      setShopCurrentPage(pg.currentPage);
      setShopTotalPages(pg.totalPages);
      setShopTotalCount(pg.totalRecords);
      setShopHasMore(pg.hasNextPage);
    } catch (err) {
      setShopError(err.message || 'Failed to fetch products');
      if (!append) {
        setShopProducts([]);
      }
    } finally {
      setShopLoading(false);
    }
  };

  const refreshProducts = () => {
    loadCategories();
    loadBrands();
    fetchProductsList(1, false);
  };

  const refreshShopProducts = () => {
    fetchShopProducts(1, false);
  };

  const loadMoreProducts = () => {
    if (!isLoading && hasMore) {
      fetchProductsList(currentPage + 1, true);
    }
  };

  const loadMoreShopProducts = () => {
    if (!shopLoading && shopHasMore) {
      fetchShopProducts(shopCurrentPage + 1, true);
    }
  };

  // Load reference data + home page products once auth is ready.
  useEffect(() => {
    if (isAuthLoading) return;
    loadCategories();
    loadBrands();
    fetchProductsList(1, false);
  }, [currentUser, isAuthLoading]);

  // Apply shop filters into the isolated shop product list.
  useEffect(() => {
    if (isAuthLoading) return;
    fetchShopProducts(1, false);
  }, [
    searchQuery,
    selectedCategory,
    selectedSort,
    priceRange,
    selectedBrands,
    currentUser,
    isAuthLoading,
  ]);

  return (
    <ProductContext.Provider
      value={{
        // shared reference data
        categories,
        brands,

        // home page ("Featured Products")
        products,
        isLoading,
        error,
        refreshProducts,
        loadMoreProducts,
        currentPage,
        totalPages,
        totalCount,
        hasMore,

        // shop page (isolated from home page)
        shopProducts,
        shopLoading,
        shopError,
        refreshShopProducts,
        loadMoreShopProducts,
        shopCurrentPage,
        shopTotalPages,
        shopTotalCount,
        shopHasMore,

        // shop filter state
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
      }}
    >
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
