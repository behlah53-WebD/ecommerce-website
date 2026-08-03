import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProducts, getCategories, fetchBrands } from '../api/productService';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { currentUser, isAuthLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  
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

  const fetchProductsList = async (page = 1, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {
        page,
        limit: 12,
        search: searchQuery.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort: selectedSort !== 'featured' ? selectedSort : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
      };

      const result = await getProducts(filters);
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

  const refreshProducts = () => {
    loadCategories();
    loadBrands();
    fetchProductsList(1, false);
  };

  const loadMoreProducts = () => {
    if (!isLoading && hasMore) {
      fetchProductsList(currentPage + 1, true);
    }
  };

  
  useEffect(() => {
    if (isAuthLoading) return;
    loadCategories();
    loadBrands();
  }, [currentUser, isAuthLoading]);

  
  useEffect(() => {
    if (isAuthLoading) return;
    fetchProductsList(1, false);
  }, [searchQuery, selectedCategory, selectedSort, priceRange, selectedBrands, currentUser, isAuthLoading]);

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        categories,
        setCategories,
        brands,
        setBrands,
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

