import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts as useProductsQuery } from "../../hooks/useQueries";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const PRODUCTS_TO_SHOW = 5;
const SLIDE_INTERVAL = 3500;

const fallbackImage =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=1500&fit=crop";

const getProductId = (product) => product?.id || product?._id;

const getProductDate = (product) => {
  const dateValue =
    product?.createdAt ||
    product?.created_at ||
    product?.dateAdded ||
    product?.addedAt;

  if (!dateValue) {
    return 0;
  }

  const timestamp = new Date(dateValue).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getProductImage = (product) => {
  return product?.images?.[0] || product?.image || fallbackImage;
};

const sortNewestProducts = (products) => {
  return [...products].sort((firstProduct, secondProduct) => {
    const dateDifference =
      getProductDate(secondProduct) - getProductDate(firstProduct);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return String(getProductId(secondProduct) || "").localeCompare(
      String(getProductId(firstProduct) || ""),
    );
  });
};

export const NewProductsSlider = ({
  title = "New Arrivals",
  subtitle = "Explore the latest products recently added to our collection.",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState([]);

  const { data: homeData, isLoading, error } = useProductsQuery({ limit: 50 });

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (homeData?.products) {
      const latestProducts = sortNewestProducts(homeData.products).slice(
        0,
        PRODUCTS_TO_SHOW,
      );
      setProducts(latestProducts);

      setActiveIndex((currentIndex) => {
        if (latestProducts.length === 0) {
          return 0;
        }
        return Math.min(currentIndex, latestProducts.length - 1);
      });
    }
  }, [homeData]);

  useEffect(() => {
    if (products.length <= 1) {
      return undefined;
    }

    const slideTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        return (currentIndex + 1) % products.length;
      });
    }, SLIDE_INTERVAL);

    return () => {
      window.clearInterval(slideTimer);
    };
  }, [products.length]);

  const goToPrevious = () => {
    if (products.length <= 1) {
      return;
    }

    setActiveIndex((currentIndex) => {
      return currentIndex === 0 ? products.length - 1 : currentIndex - 1;
    });
  };

  const goToNext = () => {
    if (products.length <= 1) {
      return;
    }

    setActiveIndex((currentIndex) => {
      return (currentIndex + 1) % products.length;
    });
  };

  const handleAddToCart = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    const stock = Number(product?.stock) || 0;

    if (stock > 0) {
      addToCart(product);
    }
  };

  const handleWishlist = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    toggleWishlist(product);
  };

  if (isLoading && (!products || products.length === 0)) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="h-[560px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-pulse dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-red-100 bg-red-50/80 p-10 text-center shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

          <p className="mt-3 font-semibold text-red-600 dark:text-red-400">
            {error.message || "Unable to load new products."}
          </p>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50/60 p-14 text-center dark:border-gray-800 dark:bg-gray-900/40">
          <p className="text-gray-500 dark:text-gray-400">
            No new products are available right now.
          </p>
        </div>
      </section>
    );
  }

  const activeProduct = products[activeIndex];
  const activeProductId = getProductId(activeProduct);
  const activeImage = getProductImage(activeProduct);
  const activeStock = Number(activeProduct?.stock) || 0;
  const activeIsOutOfStock = activeStock <= 0;
  const activeIsLowStock = activeStock > 0 && activeStock <= 10;
  const activeIsWishlisted = isInWishlist(activeProductId);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
      {/* Section heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400 sm:text-sm">
              Fresh Collection
            </p>
          </div>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <Link
          to="/shop"
          className="group inline-flex w-fit items-center rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-primary-600 hover:bg-primary-600 hover:text-white dark:border-gray-700 dark:text-gray-200"
        >
          View All Products
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Full-image slider */}
      <div className="relative h-[460px] overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] sm:h-[520px] lg:h-[580px]">
        {/* Full-bleed background image */}
        <Link
          to={`/product/${activeProductId}`}
          className="absolute inset-0 block h-full w-full"
        >
          <img
            key={activeImage}
            src={activeImage}
            alt={activeProduct.name || "Product"}
            className="h-full w-full object-cover transition-transform duration-[3000ms] ease-out"
            loading="lazy"
          />
        </Link>

        {/* Scrim for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Status badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 sm:left-6 sm:top-6">
          {activeProduct.isNew && (
            <span className="rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              New Arrival
            </span>
          )}

          {activeProduct.isSale && (
            <span className="rounded-full bg-red-500/95 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              On Sale
            </span>
          )}

          {activeProduct.isBestseller && (
            <span className="rounded-full bg-amber-500/95 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              Bestseller
            </span>
          )}

          {activeIsOutOfStock && (
            <span className="flex items-center gap-1 rounded-full bg-gray-900/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              Out of Stock
            </span>
          )}

          {activeIsLowStock && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              <PackageCheck className="h-3.5 w-3.5" />
              Only {activeStock} Left
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={(event) => handleWishlist(event, activeProduct)}
          aria-label={
            activeIsWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all active:scale-90 sm:right-6 sm:top-6 ${
            activeIsWishlisted
              ? "bg-red-500 text-white"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${activeIsWishlisted ? "fill-white" : ""}`}
          />
        </button>

        {/* Essential info overlaid on image */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              {activeProduct.category || "Featured Product"}
            </p>

            <h3 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
              {activeProduct.name || "Product"}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-white">
                  {activeProduct.rating || "4.8"}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white sm:text-3xl">
                  ₹{activeProduct.price || 0}
                </span>

                {activeProduct.originalPrice &&
                  Number(activeProduct.originalPrice) >
                    Number(activeProduct.price) && (
                    <span className="text-sm text-white/60 line-through">
                      ₹{activeProduct.originalPrice}
                    </span>
                  )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={(event) => handleAddToCart(event, activeProduct)}
                disabled={activeIsOutOfStock}
                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold shadow-lg transition-all active:scale-[0.98] sm:h-12 sm:w-auto sm:px-6 sm:text-base ${
                  activeIsOutOfStock
                    ? "cursor-not-allowed bg-white/20 text-white/50 shadow-none"
                    : "bg-white text-gray-900 hover:bg-primary-600 hover:text-white"
                }`}
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {activeIsOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <Link
                to={`/product/${activeProductId}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-full border-2 border-white/40 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/10 active:scale-[0.98] sm:h-12 sm:w-auto sm:px-6 sm:text-base"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous product"
              className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 active:scale-95 sm:left-5 sm:h-11 sm:w-11 sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next product"
              className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 active:scale-95 sm:right-5 sm:h-11 sm:w-11 sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Slide indicators, overlaid on image */}
        {products.length > 1 && (
          <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2 sm:bottom-6">
            {products.map((product, index) => {
              const productId = getProductId(product);

              return (
                <button
                  key={productId || index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? "w-8 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewProductsSlider;