import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { FeatureBanner } from '../components/home/FeatureBanner';
import { ShockingDealSection } from '../components/home/ShockingDealSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ProductGrid } from '../components/products/ProductGrid';
import {NewProductsSlider} from '../components/home/NewProductsSlider';

export const HomePage = () => {
  return (
    <div className="space-y-2">
      {}
      <HeroSection />

      {}
      <FeatureBanner />

      <ShockingDealSection />

      <NewProductsSlider/>

      {}
      <div className="py-5 -mt-25">
      <CategoryGrid />
    </div>

      {}
      <section className="bg-white py-16 dark:bg-gray-950 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
                Featured Products
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Handpicked selection of trending items ready for your backend API data
              </p>
            </div>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ProductGrid />
        </div>
      </section>
    </div>
  );
};