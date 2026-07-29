import React from 'react';
import { ProductFilter } from '../components/products/ProductFilter';
import { ProductGrid } from '../components/products/ProductGrid';
import { useProducts } from '../hooks/useProducts';

export const ShopPage = () => {
  const { totalCount, selectedCategory } = useProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      {}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Showing {totalCount} products ready to sync with your backend API.
        </p>
      </div>

      {}
      <ProductFilter />

      {}
      <ProductGrid />
    </div>
  );
};
