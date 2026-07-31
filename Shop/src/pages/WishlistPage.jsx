import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ArrowRight,
  ShoppingBag,
  Share2,
  Download,
  Filter,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { ProductCard } from "../components/products/ProductCard";
import { getProducts } from "../api/productService";

export const WishlistPage = () => {
  const { wishlistItems, wishlistCount } = useWishlist();
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [stockMap, setStockMap] = useState({});
  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!wishlistItems.length) {
        setStockLoading(false);
        return;
      }

      try {
        const { products } = await getProducts({ limit: 200 });
        const map = {};
        products.forEach((p) => {
          const pid = String(p.id || p._id);
          map[pid] = {
            stock: p.stock,
            productStatus: p.productStatus,
          };
        });
        setStockMap(map);
      } catch (err) {
        console.warn("Failed to fetch stock data for wishlist:", err);
      } finally {
        setStockLoading(false);
      }
    };

    fetchStockData();
  }, [wishlistItems]);

  const enrichedItems = wishlistItems.map((item) => {
    const pid = String(item.productId || item.id || item._id);
    const stockData = stockMap[pid];
    if (stockData) {
      return { ...item, stock: stockData.stock, productStatus: stockData.productStatus };
    }
    return item;
  });

  const filteredItems = enrichedItems.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    return 0; // newest - keep original order
  });

  if (wishlistCount === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="mx-auto max-w-lg px-4 text-center">
          {/* Animated Heart Icon */}
          <div className="relative inline-flex mb-8">
            <div className="flex h-28 w-28 mx-auto items-center justify-center rounded-3xl bg-pink-50 dark:bg-pink-950/30">
              <Heart className="h-14 w-14 text-pink-400" />
            </div>
            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-500/30 animate-bounce">
              0
            </div>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Your Wishlist is Empty
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
            Save your favorite products here by clicking the heart icon on any
            product card. Start exploring our collections to find items you'll
            love.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
            >
              <ShoppingBag className="h-5 w-5" />
              Explore Products
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-3.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Browse Categories
            </Link>
          </div>

          {/* Trending Categories */}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Trending Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Clothing",
                "Footwear",
                "Accessories",
                "Watches",
                "Jewelry",
              ].map((cat) => (
                <Link
                  key={cat}
                  to={`/categories/${cat.toLowerCase()}`}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link
              to="/"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              Wishlist
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-500 shadow-sm">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  My Wishlist
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  navigator.clipboard?.writeText(window.location.href)
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                title="Share Wishlist"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                title="Print Wishlist"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 lg:p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Button (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {searchTerm && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500">Search results for:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {sortedItems.length}{" "}
                {sortedItems.length === 1 ? "result" : "results"}
              </span>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {stockLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mr-3" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Loading stock details...
            </span>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No items match your search
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid"
                  ? "sm:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {sortedItems.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Showing {sortedItems.length} of {wishlistCount} saved items
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
