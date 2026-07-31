import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, AlertCircle, PackageCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const id = product.id || product._id;
  const isWishlisted = isInWishlist(id);
  
  const stock = product.stock || 0;
  const productStatus = product.productStatus || (stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock');
  const isOutOfStock = productStatus === 'Out of Stock' || stock <= 0;
  const isLowStock = productStatus === 'Low Stock' || (stock > 0 && stock <= 10);

  const getStockBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Out of Stock
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Low Stock ({stock} left)
        </span>
      );
    }
    return (
      <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm flex items-center gap-1">
        <PackageCheck className="h-3 w-3" />
        In Stock
      </span>
    );
  };

  const mainImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop';
  const hoverImage = product.images?.[1] || mainImage;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <div className="group relative rounded-2xl bg-white p-3 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl">
      {}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        <Link to={`/product/${id}`}>
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.images?.length > 1 && (
            <img
              src={hoverImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        {}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              New
            </span>
          )}
          {product.isSale && (
            <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              Sale
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              Bestseller
            </span>
          )}
          {getStockBadge()}
        </div>

        {}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-gray-900 dark:text-white shadow-lg transition-colors ${
              isOutOfStock
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-900 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-900 shadow-lg transition-colors ${
              isWishlisted ? 'text-red-500' : 'text-gray-700 dark:text-gray-300 hover:text-red-500'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {}
      <div className="mt-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {product.category || 'General'}
            </p>
            <h3 className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
              <Link to={`/product/${id}`} className="hover:text-primary-600 transition-colors">
                {product.name}
              </Link>
            </h3>
          </div>

          {}
          <div className="flex shrink-0 items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {product.rating || '4.8'}
            </span>
          </div>
        </div>

        {}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-white">
            ${product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            {product.colors.map((color, idx) => (
              <span
                key={idx}
                className="h-3.5 w-3.5 rounded-full border border-gray-300 dark:border-gray-600 shadow-xs"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
