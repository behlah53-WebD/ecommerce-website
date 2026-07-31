import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-gray-900 flex items-center">
      {}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
          alt="Fashion collection hero"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent" />
      </div>

      {}
      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-center px-4 py-20 lg:px-8 w-full">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md border border-white/10">
            <Sparkles className="h-4 w-4 text-primary-400" />
            New Spring & Summer Collection
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-200">
              Everyday Style
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-300 sm:text-xl">
            Discover curated collections of premium fashion and lifestyle products. Timeless designs crafted for the modern individual.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 font-semibold text-white transition-all hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/25"
            >
              Shop Collection
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/categories"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Browse Categories
            </Link>
          </div>

          {}
          <div className="mt-16 flex items-center gap-8 border-t border-white/15 pt-8">
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">50K+</div>
              <div className="text-xs sm:text-sm text-gray-400">Happy Customers</div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-display text-2xl sm:text-3xl font-bold text-white">4.9</span>
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Average Rating</div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">500+</div>
              <div className="text-xs sm:text-sm text-gray-400">Premium Products</div>
            </div>
          </div>
        </div>

        {}
        <div className="absolute bottom-12 right-8 hidden space-y-4 lg:block">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20 text-primary-300">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Free Express Shipping</p>
                <p className="text-xs text-gray-300">On orders over $100</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">100% Guaranteed Quality</p>
                <p className="text-xs text-gray-300">30-day hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};