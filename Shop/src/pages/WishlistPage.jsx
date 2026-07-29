import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/products/ProductCard';

export const WishlistPage = () => {
  const { wishlistItems, wishlistCount } = useWishlist();

  if (wishlistCount === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8 min-h-[60vh] flex flex-col items-center justify-center">
        <Heart className="h-20 w-20 text-gray-300 dark:text-gray-700 mb-4" />
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Your Wishlist is Empty</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
          Save your favorite products here by clicking the heart icon on any product card.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
        >
          Discover Products
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-8">
        My Wishlist ({wishlistCount})
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
};
