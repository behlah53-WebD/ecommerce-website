import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, ArrowLeft, Tag, Factory, AlertCircle, PackageCheck } from 'lucide-react';
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
      const data = await getProductById(id);
      setProduct(data);
      if (data?.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Not Found</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The requested product endpoint did not return data. Connect your backend API to fetch live details.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id || product._id);
  const images = product.images?.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1000&fit=crop'];
  
  const stock = product.stock || 0;
  const productStatus = product.productStatus || (stock > 10 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock');
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 10;
  
  const getStockColor = () => {
    if (isOutOfStock) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    if (isLowStock) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
  };
  
  const getStockIcon = () => {
    if (isOutOfStock) return <AlertCircle className="h-4 w-4" />;
    if (isLowStock) return <PackageCheck className="h-4 w-4" />;
    return <PackageCheck className="h-4 w-4" />;
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
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        {}
        <div className="space-y-4">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                    activeImageIndex === idx ? 'border-primary-600' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              {product.category || 'Collection'}
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {product.name}
            </h1>

            {}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                <Star className="h-5 w-5 fill-amber-400" />
                <span className="ml-1 font-bold text-gray-900 dark:text-white">{product.rating || 4.9}</span>
              </div>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">128 Customer Reviews</span>
            </div>

            {}
            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-display text-3xl font-bold text-gray-900 dark:text-white">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            {}
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border {getStockColor()}">
              {getStockIcon()}
              <span className="text-sm font-semibold">
                {productStatus}: {stock} {stock === 1 ? 'item' : 'items'} left
              </span>
            </div>

            {}
            {product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.brand && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                  <Tag className="h-5 w-5 shrink-0 text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{product.brand}</p>
                  </div>
                </div>
              )}
              {product.manufacturer && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                  <Factory className="h-5 w-5 shrink-0 text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manufacturer</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{product.manufacturer}</p>
                  </div>
                </div>
              )}
            </div>

            {}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Size</h3>
                <div className="mt-3 flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
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

          {}
          <div className="mt-8 space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white transition-all shadow-lg ${
                  isOutOfStock
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 transition-colors ${
                  isWishlisted ? 'text-red-500 bg-red-50 dark:bg-gray-800' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300'
                }`}
                disabled={isOutOfStock}
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {!isOutOfStock && stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Qty:</span>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-semibold text-gray-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= stock}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  +
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">Max: {stock}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <Truck className="h-5 w-5 text-primary-600" />
                <div className="text-xs">
                  <p className="font-semibold text-gray-900 dark:text-white">Free Delivery</p>
                  <p className="text-gray-500 dark:text-gray-400">Orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
                <div className="text-xs">
                  <p className="font-semibold text-gray-900 dark:text-white">30 Day Returns</p>
                  <p className="text-gray-500 dark:text-gray-400">Guaranteed quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
