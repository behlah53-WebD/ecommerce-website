import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  PackageCheck,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../api/productService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const PRODUCTS_TO_SHOW = 5;
const SLIDE_INTERVAL = 5000;
const BACKEND_REFRESH_INTERVAL = 30000;

const fallbackImage =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=1500&fit=crop';

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

const normalizeProductsResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.products)) {
    return response.data.products;
  }

  return [];
};

const sortNewestProducts = (products) => {
  return [...products].sort((firstProduct, secondProduct) => {
    const dateDifference =
      getProductDate(secondProduct) - getProductDate(firstProduct);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return String(getProductId(secondProduct) || '').localeCompare(
      String(getProductId(firstProduct) || '')
    );
  });
};

export const NewProductsSlider = ({
  title = 'New Arrivals',
  subtitle = 'Explore the latest products recently added to our collection.',
}) => {
  const [products, setProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const fetchNewProducts = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError('');

      const response = await getProducts();
      const backendProducts = normalizeProductsResponse(response);

      const latestProducts = sortNewestProducts(backendProducts).slice(
        0,
        PRODUCTS_TO_SHOW
      );

      setProducts(latestProducts);

      setActiveIndex((currentIndex) => {
        if (latestProducts.length === 0) {
          return 0;
        }

        return Math.min(currentIndex, latestProducts.length - 1);
      });
    } catch (fetchError) {
      console.error('Failed to fetch new products:', fetchError);

      if (showLoader) {
        setError('Unable to load new products.');
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNewProducts(true);

    const refreshTimer = window.setInterval(() => {
      fetchNewProducts(false);
    }, BACKEND_REFRESH_INTERVAL);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [fetchNewProducts]);

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
      return currentIndex === 0
        ? products.length - 1
        : currentIndex - 1;
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

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="h-[420px] overflow-hidden rounded-3xl bg-gray-200 animate-pulse dark:bg-gray-800" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
          <p className="font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchNewProducts(true)}
            className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900">
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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:px-8">
      {/* Section heading */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 sm:text-sm">
            Fresh Collection
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex w-fit items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
        >
          View All Products
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {/* Fixed-size slider */}
      <div className="relative h-[620px] overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:h-[500px] lg:h-[480px]">
        <div className="grid h-full grid-cols-1 lg:grid-cols-2">
          {/* Fixed-size product image */}
          <div className="relative h-[260px] overflow-hidden bg-gray-100 sm:h-[320px] lg:h-full">
            <Link
              to={`/product/${activeProductId}`}
              className="block h-full w-full"
            >
              <img
                key={activeImage}
                src={activeImage}
                alt={activeProduct.name || 'Product'}
                className="h-full w-full object-cover transition-all duration-700"
              />
            </Link>

            <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 sm:left-5 sm:top-5">
              {activeProduct.isNew && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  New Arrival
                </span>
              )}

              {activeProduct.isSale && (
                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  On Sale
                </span>
              )}

              {activeProduct.isBestseller && (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  Bestseller
                </span>
              )}

              {activeIsOutOfStock && (
                <span className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Out of Stock
                </span>
              )}

              {activeIsLowStock && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  <PackageCheck className="h-3.5 w-3.5" />
                  Only {activeStock} Left
                </span>
              )}
            </div>
          </div>

          {/* Fixed-size product information */}
          <div className="flex h-full flex-col justify-center overflow-hidden p-6 sm:p-8 lg:p-10">
            <p className="h-5 overflow-hidden text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
              {activeProduct.category || 'Featured Product'}
            </p>

            <h3 className="mt-3 line-clamp-2 min-h-[56px] overflow-hidden text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:text-3xl">
              {activeProduct.name || 'Product'}
            </h3>

            <div className="mt-4 flex h-6 items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />

                <span className="font-semibold text-gray-900 dark:text-white">
                  {activeProduct.rating || '4.8'}
                </span>
              </div>

              <span className="text-gray-300 dark:text-gray-700">|</span>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                Premium quality
              </span>
            </div>

            <p className="mt-4 line-clamp-3 h-[72px] overflow-hidden text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
              {activeProduct.description ||
                'Discover premium quality and excellent design in this latest product from our collection.'}
            </p>

            <div className="mt-5 flex h-9 items-center flex-wrap gap-3">
              <span className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                ${activeProduct.price || 0}
              </span>

              {activeProduct.originalPrice &&
                Number(activeProduct.originalPrice) >
                  Number(activeProduct.price) && (
                  <span className="text-lg text-gray-400 line-through">
                    ${activeProduct.originalPrice}
                  </span>
                )}
            </div>

            <div className="mt-4 h-9">
              {activeProduct.brand && (
                <>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Brand
                  </span>

                  <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {activeProduct.brand}
                  </p>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={(event) => handleAddToCart(event, activeProduct)}
                disabled={activeIsOutOfStock}
                className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 font-semibold text-white shadow-lg transition-colors ${
                  activeIsOutOfStock
                    ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-700'
                    : 'bg-primary-600 shadow-primary-600/20 hover:bg-primary-700'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                {activeIsOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={(event) => handleWishlist(event, activeProduct)}
                aria-label={
                  activeIsWishlisted
                    ? 'Remove from wishlist'
                    : 'Add to wishlist'
                }
                className={`flex h-12 w-full items-center justify-center rounded-xl border transition-colors sm:w-12 ${
                  activeIsWishlisted
                    ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-900 dark:bg-red-950/30'
                    : 'border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-500 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${
                    activeIsWishlisted ? 'fill-red-500' : ''
                  }`}
                />
              </button>
            </div>

            <Link
              to={`/product/${activeProductId}`}
              className="mt-3 inline-flex h-5 w-fit items-center text-sm font-semibold text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400"
            >
              View Product Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Navigation buttons */}
        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous product"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-primary-600 sm:left-5"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next product"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-primary-600 sm:right-5"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Slide indicators */}
      {products.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {products.map((product, index) => {
            const productId = getProductId(product);

            return (
              <button
                key={productId || index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`h-2 rounded-full transition-all ${
                  activeIndex === index
                    ? 'w-8 bg-primary-600'
                    : 'w-2 bg-gray-300 hover:bg-primary-400 dark:bg-gray-700'
                }`}
              />
            );
          })}
        </div>
      )}

      <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        Showing {activeIndex + 1} of {products.length} new products
      </p>
    </section>
  );
};

export default NewProductsSlider;