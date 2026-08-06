import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/products/ProductCard";
import { ProductSkeleton } from "../components/products/ProductSkeleton";
import { EmptyProductsState } from "../components/products/EmptyProductsState";
import { useProducts } from "../hooks/useProducts";
import { useInfiniteScroll } from "react-infinite-scroll-component";
import { PriceRangeSlider } from "../components/filters/PriceRangeSlider";
import {
  Sparkles,
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  ArrowLeft,
  Search,
  Filter,
  Loader2,
} from "lucide-react";

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
    priceRange,
    setPriceRange,
    brands = [],
    selectedBrands,
    setSelectedBrands,
    searchQuery,
    setSearchQuery,
  } = useProducts();

  // Local component states
  const [sortBy, setSortBy] = useState("featured");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Map context search state to component search terms
  const searchTerm = searchQuery ?? "";
  const setSearchTerm = setSearchQuery;

  const backendCategories = (categories || []).filter((cat) => cat !== "All");

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "brand-asc", label: "Brand: A to Z" },
    { value: "brand-desc", label: "Brand: Z to A" },
    { value: "rating", label: "Highest Rated" },
    { value: "popular", label: "Most Popular" },
  ];

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

  const categoryIcons = {
    clothing: "👕",
    clothes: "👕",
    apparel: "👕",
    fashion: "👕",
    footwear: "👟",
    shoes: "👟",
    sneakers: "👟",
    accessories: "👜",
    bags: "👜",
    handbags: "👜",
    watches: "⌚",
    watch: "⌚",
    jewelry: "💎",
    jewellery: "💎",
    electronics: "📱",
    gadgets: "📱",
    beauty: "💄",
    cosmetics: "💄",
    makeup: "💄",
    sports: "⚽",
    fitness: "⚽",
    home: "🏠",
    furniture: "🏠",
    decor: "🏠",
    books: "📚",
    stationery: "📚",
  };

  // Memoized category icon function
  const getCategoryIcon = useCallback((catName) => {
    const key = String(catName || "")
      .trim()
      .toLowerCase();

    return categoryIcons[key] || "📦";
  }, []);

  const displayedCategories = useMemo(
    () =>
      showAllCategories ? backendCategories : backendCategories.slice(0, 6),
    [backendCategories, showAllCategories],
  );

  const hasActiveFilters = useMemo(
    () =>
      selectedCategory !== "All" ||
      selectedBrands.length > 0 ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 1000 ||
      Boolean(searchQuery),
    [selectedCategory, selectedBrands, priceRange, searchQuery],
  );

  return (
    <div className="h-fit bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:pt-10 lg:pb-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {selectedCategory !== "All" && (
                <Link
                  to="/shop"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              )}

              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </h1>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {shopTotalCount} {shopTotalCount === 1 ? "product" : "products"}{" "}
              available
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8 h-[calc(100vh-160px)]">
          {/* Desktop Sidebar */}
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary-500" />
                    Categories
                  </h3>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedCategory === "All"
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">🛍️</span>
                      All Products
                    </span>

                    <span className="text-xs text-gray-400">
                      {shopTotalCount}
                    </span>
                  </button>

                  {displayedCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">
                          {getCategoryIcon(category)}
                        </span>
                        {category}
                      </span>
                    </button>
                  ))}

                  {backendCategories.length > 6 && (
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
                          Show All ({backendCategories.length})
                          <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

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
              {brands.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary-500" />
                        Brand
                      </h3>

                      {selectedBrands.length > 0 && (
                        <button
                          onClick={() => setSelectedBrands([])}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    {brands.map((brand) => {
                      const isChecked = selectedBrands.includes(brand);

                      return (
                        <label
                          key={brand}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(
                                  selectedBrands.filter((b) => b !== brand),
                                );
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                          />

                          <span className="truncate">{brand}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Help Card */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
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

          {/* Products Grid */}
          <main
            id="shop-scroll-target"
            className="flex-1 min-w-0 overflow-y-auto"
          >
            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {selectedCategory !== "All" && (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Category:
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                    {selectedCategory}

                    <button
                      onClick={() => setSelectedCategory("All")}
                      aria-label="Remove category filter"
                    >
                      <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
                    </button>
                  </span>
                </>
              )}

              {sortBy !== "featured" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
                  Sort: {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  <button
                    onClick={() => setSortBy("featured")}
                    aria-label="Clear sorting"
                  >
                    <X className="h-3 w-3 hover:text-gray-900 dark:hover:text-white" />
                  </button>
                </span>
              )}

              {(priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                  <button
                    onClick={() => setPriceRange([0, 1000])}
                    aria-label="Clear price filter"
                  >
                    <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
                  </button>
                </span>
              )}

              {selectedBrands.length > 0 &&
                selectedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium"
                  >
                    {brand}

                    <button
                      onClick={() =>
                        setSelectedBrands(
                          selectedBrands.filter((b) => b !== brand),
                        )
                      }
                      aria-label={`Remove ${brand} filter`}
                    >
                      <X className="h-3 w-3 hover:text-primary-900 dark:hover:text-primary-300" />
                    </button>
                  </span>
                ))}

              {!hasActiveFilters && (
                <span className="text-xs text-gray-400">No active filters</span>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {shopTotalCount}
                </span>{" "}
                results
                {sortBy !== "featured" && (
                  <span className="ml-1">
                    • Sorted by{" "}
                    {sortOptions
                      .find((opt) => opt.value === sortBy)
                      ?.label.toLowerCase()}
                  </span>
                )}
              </p>

              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <Grid3X3 className="h-3.5 w-3.5" />
                <span>Grid View</span>
              </div>
            </div>

            {/* Products Display */}
            {shopLoading && (!sortedProducts || sortedProducts.length === 0) ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ProductSkeleton key={idx} />
                ))}
              </div>
            ) : !sortedProducts || sortedProducts.length === 0 ? (
              <EmptyProductsState
                title={
                  hasActiveFilters
                    ? "No products match your filters"
                    : "No Products Available"
                }
                message={
                  hasActiveFilters
                    ? "Try adjusting or clearing your filters to see more products."
                    : "The product catalog is currently blank and ready for your backend API data integration."
                }
                onRefresh={refreshShopProducts}
                loading={shopLoading}
              />
            ) : (
              <div className="flex flex-col items-center gap-8">
                <div className="w-full grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id || product._id}
                      product={product}
                    />
                  ))}
                </div>

                {shopHasMore && (
                  <div className="flex flex-col items-center justify-center pt-2 pb-6">
                    {shopLoading ? (
                      <div
                        key="loading-spinner"
                        className="flex flex-col items-center gap-2.5 text-gray-500 dark:text-gray-400"
                      >
                        <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
                        <span className="text-xs font-semibold tracking-wide uppercase">
                          Loading products...
                        </span>
                      </div>
                    ) : null}
                    <div
                      ref={sentinelRef}
                      key="load-sentinel"
                      className="h-1 w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[10000] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilter(false)}
          />

          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl animate-slideInRight overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Filters
                </h2>
              </div>

              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Mobile Sort */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Categories */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary-500" />
                  Categories
                </h3>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setShowMobileFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === "All"
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">🛍️</span>
                      All Products
                    </span>
                  </button>

                  {backendCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowMobileFilter(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">
                          {getCategoryIcon(category)}
                        </span>
                        {category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Price Range
                </label>

                <PriceRangeSlider
                  min={0}
                  max={1000}
                  value={priceRange}
                  onCommit={(range) => setPriceRange(range)}
                />
              </div>

              {/* Mobile Brand */}
              {brands.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Brand
                  </label>

                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {brands.map((brand) => {
                      const isChecked = selectedBrands.includes(brand);

                      return (
                        <label
                          key={brand}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(
                                  selectedBrands.filter((b) => b !== brand),
                                );
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                          />

                          <span className="truncate">{brand}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
