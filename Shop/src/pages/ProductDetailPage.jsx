import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Star,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Tag,
  Factory,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';
import { Magnifier } from 'solguruz-react-image-magnifier';
import { getProductById } from '../api/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductDetailPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);

      try {
        const data = await getProductById(id);

        setProduct(data);

        if (data?.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
        } else {
          setSelectedSize(null);
        }

        setActiveImageIndex(0);
        setQuantity(1);
      } catch (error) {
        console.error('Failed to fetch product details:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-16 lg:px-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Product Not Found
        </h2>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The requested product endpoint did not return data. Connect your backend
          API to fetch live details.
        </p>

        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </div>
    );
  }

  const productId = product.id || product._id;
  const isWishlisted = isInWishlist(productId);

  const fallbackImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=1500&fit=crop';

  const images =
    product.images?.length > 0
      ? product.images
      : [product.image || fallbackImage];

  const activeImage = images[activeImageIndex] || images[0];

  const stock = Number(product.stock) || 0;

  const productStatus =
    product.productStatus ||
    (stock > 10 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock');

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 10;

  const getStockColor = () => {
    if (isOutOfStock) {
      return 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400';
    }

    if (isLowStock) {
      return 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
    }

    return 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
  };

  const getStockIcon = () => {
    if (isOutOfStock) {
      return <AlertCircle className="h-4 w-4 shrink-0" />;
    }

    return <PackageCheck className="h-4 w-4 shrink-0" />;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart(product, quantity, null, selectedSize);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;

    if (newQty >= 1 && newQty <= stock) {
      setQuantity(newQty);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <Link
        to="/shop"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="product-magnifier-wrapper relative overflow-visible rounded-2xl border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
            <div className="flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl p-4 sm:min-h-[520px] lg:min-h-[620px]">
              <Magnifier
                image={activeImage}
                zoom={2}
                width="100%"
                magnifierWidth={180}
                magnifierHeight={180}
                borderWidth={2}
                borderColor="#ffffff"
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setQuantity(1);
                  }}
                  aria-label={`View product image ${idx + 1}`}
                  aria-pressed={activeImageIndex === idx}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-primary-600 ring-2 ring-primary-600/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              {product.category || 'Collection'}
            </span>

            <h1 className="mt-2 font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                <Star className="h-5 w-5 fill-amber-400" />

                <span className="ml-1 font-bold text-gray-900 dark:text-white">
                  {product.rating || 4.9}
                </span>
              </div>

              <span className="text-sm text-gray-400">•</span>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                128 Customer Reviews
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-display text-3xl font-bold text-gray-900 dark:text-white">
                ${product.price}
              </span>

              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
            </div>

            {/* Stock Status */}
            <div
              className={`mt-4 flex items-center gap-3 rounded-xl border p-3 ${getStockColor()}`}
            >
              {getStockIcon()}

              <span className="text-sm font-semibold">
                {productStatus}: {stock} {stock === 1 ? 'item' : 'items'} left
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Description
                </h3>

                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Brand and Manufacturer */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.brand && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <Tag className="h-5 w-5 shrink-0 text-primary-600" />

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Brand
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                      {product.brand}
                    </p>
                  </div>
                </div>
              )}

              {product.manufacturer && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <Factory className="h-5 w-5 shrink-0 text-primary-600" />

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Manufacturer
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                      {product.manufacturer}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Size
                </h3>

                <div className="mt-3 flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-gray-800 dark:text-primary-400'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Actions */}
          <div className="mt-8 space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white shadow-lg transition-all ${
                  isOutOfStock
                    ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-700'
                    : 'bg-primary-600 shadow-primary-500/20 hover:bg-primary-700'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                disabled={isOutOfStock}
                aria-label={
                  isWishlisted
                    ? 'Remove from wishlist'
                    : 'Add to wishlist'
                }
                className={`flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 transition-colors dark:border-gray-800 ${
                  isWishlisted
                    ? 'bg-red-50 text-red-500 dark:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300'
                }`}
              >
                <Heart
                  className={`h-6 w-6 ${
                    isWishlisted ? 'fill-red-500' : ''
                  }`}
                />
              </button>
            </div>

            {/* Quantity */}
            {!isOutOfStock && stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Qty:
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  -
                </button>

                <span className="w-12 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= stock}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  +
                </button>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Max: {stock}
                </span>
              </div>
            )}

            {/* Delivery and Returns */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                <Truck className="h-5 w-5 text-primary-600" />

                <div className="text-xs">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Free Delivery
                  </p>

                  <p className="text-gray-500 dark:text-gray-400">
                    Orders over $100
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                <ShieldCheck className="h-5 w-5 text-primary-600" />

                <div className="text-xs">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    30 Day Returns
                  </p>

                  <p className="text-gray-500 dark:text-gray-400">
                    Guaranteed quality
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};