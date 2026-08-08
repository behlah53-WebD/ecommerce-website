import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useInfiniteScroll } from "react-infinite-scroll-component";
import { useDebounce } from "../hooks/useDebounce";
import { useProducts } from "../hooks/useProducts";
import { 
  DesktopSidebar, 
  MobileFilterDrawer,
  ShopHeader,
  ActiveFiltersBar,
  ResultsCount,
  ProductsDisplay,
} from "../components/shop";
import { SORT_OPTIONS, ALL_CATEGORY, DEFAULT_PRICE_RANGE } from "../constants";

export const ShopPage = () => {
  const {
    shopTotalCount,
    selectedCategory,
    setSelectedCategory,
    categories = [],
    shopProducts,
    shopLoading,
    shopHasMore,
    refreshShopProducts,
    loadMoreShopProducts,
    isShopFetchingMore,
    priceRange,
    setPriceRange,
    brands = [],
    selectedBrands,
    setSelectedBrands,
    toggleBrand,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
  } = useProducts();

  // Local component states
  const [sortBy, setSortBy] = useState("featured");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery || "");

  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      setSearchQuery(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchQuery, setSearchQuery]);

  // Map context search state to component search terms
  const searchTerm = localSearchTerm;
  const setSearchTerm = setLocalSearchTerm;

  // Memoized sort function to prevent recreation on every render
  const sortProducts = useCallback((products, sortBy) => {
    if (!products || products.length === 0) return [];

    const sorted = [...products];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));

      case "price-high":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));

      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );

      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      case "brand-asc":
        return sorted.sort((a, b) =>
          (a.brand || "").localeCompare(b.brand || ""),
        );

      case "brand-desc":
        return sorted.sort((a, b) =>
          (b.brand || "").localeCompare(a.brand || ""),
        );

      case "popular":
        return sorted.sort(
          (a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0),
        );

      case "featured":
      default:
        return sorted;
    }
  }, []);

  const sortedProducts = useMemo(
    () => sortProducts(shopProducts || [], sortBy),
    [shopProducts, sortBy, sortProducts],
  );

  const { sentinelRef } = useInfiniteScroll({
    next: loadMoreShopProducts,
    hasMore: shopHasMore,
    dataLength: sortedProducts.length,
    scrollThreshold: "200px",
    scrollableTarget: "shop-scroll-target",
  });

  return (
    <div className="h-fit bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:pt-10 lg:pb-4">
        {/* Header */}
        <ShopHeader
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          shopTotalCount={shopTotalCount}
          ALL_CATEGORY={ALL_CATEGORY}
          sortBy={sortBy}
          setSortBy={setSortBy}
          setShowMobileFilter={setShowMobileFilter}
          SORT_OPTIONS={SORT_OPTIONS}
        />

        {/* Main Content */}
        <div className="flex gap-8 h-[calc(100vh-160px)]">
          {/* Desktop Sidebar */}
          <DesktopSidebar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            shopTotalCount={shopTotalCount}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            brands={brands}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            toggleBrand={toggleBrand}
            showAllCategories={showAllCategories}
            setShowAllCategories={setShowAllCategories}
          />

          {/* Products Grid */}
          <main id="shop-scroll-target" className="flex-1 min-w-0 overflow-y-auto">
            <ActiveFiltersBar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              hasActiveFilters={hasActiveFilters}
              ALL_CATEGORY={ALL_CATEGORY}
              DEFAULT_PRICE_RANGE={DEFAULT_PRICE_RANGE}
            />

            <ResultsCount
              shopTotalCount={shopTotalCount}
              sortBy={sortBy}
              SORT_OPTIONS={SORT_OPTIONS}
            />

            <ProductsDisplay
              shopLoading={shopLoading}
              isShopFetchingMore={isShopFetchingMore}
              sortedProducts={sortedProducts}
              shopTotalCount={shopTotalCount}
              hasActiveFilters={hasActiveFilters}
              shopHasMore={shopHasMore}
              loadMoreShopProducts={loadMoreShopProducts}
              sentinelRef={sentinelRef}
              refreshShopProducts={refreshShopProducts}
            />
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
<MobileFilterDrawer
          showMobileFilter={showMobileFilter}
          setShowMobileFilter={setShowMobileFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={SORT_OPTIONS}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          brands={brands}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          toggleBrand={toggleBrand}
        />
    </div>
  );
};