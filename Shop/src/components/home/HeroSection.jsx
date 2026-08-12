import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Star, ShieldCheck, Truck, ChevronDown } from 'lucide-react';
import apiClient from '../../api/apiClient';

const HERO_CACHE_KEY = 'hero_banner_cache';

const defaultHero = {
  subtitle: "New Spring & Summer Collection",
  title: "Elevate Your Everyday Style",
  description: "Discover curated collections of premium fashion and lifestyle products. Timeless designs crafted for the modern individual.",
  imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop",
  buttonText1: "Shop Collection",
  buttonLink1: "/shop",
  buttonText2: "Browse Categories",
  buttonLink2: "/categories",
};

const getCachedHero = () => {
  try {
    const cached = localStorage.getItem(HERO_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
};

export const HeroSection = () => {
  // Initialize directly from localStorage cache to prevent any flash on reload
  const [heroData, setHeroData] = useState(() => getCachedHero() || defaultHero);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await apiClient.get('/users/hero/list');
        if (response.data?.success && response.data.data?.length > 0) {
          const slide = response.data.data[0];
          // Only update state + cache if the data changed (prevents unnecessary re-render)
          const current = getCachedHero();
          if (!current || current._id !== slide._id || current.imageUrl !== slide.imageUrl) {
            setHeroData(slide);
            localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(slide));
          }
        }
      } catch (error) {
        console.warn("Failed to load hero banner from database, using cached/fallback:", error);
      }
    };
    fetchHeroData();
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gray-900 flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroData.imageUrl}
          alt={heroData.title}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 pt-[112px] pb-20 lg:px-8 lg:pt-[120px] w-full">
        <div className="max-w-2xl">
          {heroData.subtitle && (
            <span
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md border border-white/10 animate-fade-up"
              style={{ animationDelay: '0.05s' }}
            >
              <Sparkles className="h-4 w-4 text-primary-400" />
              {heroData.subtitle}
            </span>
          )}

          <h1
            className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight animate-fade-up"
            style={{ animationDelay: '0.15s' }}
          >
            {heroData.title}
          </h1>

          <p
            className="mt-6 text-lg text-gray-300 sm:text-xl animate-fade-up"
            style={{ animationDelay: '0.25s' }}
          >
            {heroData.description}
          </p>

          <div
            className="mt-10 flex flex-col gap-4 sm:flex-row animate-fade-up"
            style={{ animationDelay: '0.35s' }}
          >
            {heroData.buttonText1 && (
              <Link
                to={heroData.buttonLink1 || "/shop"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 font-semibold text-white transition-all hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/25"
              >
                {heroData.buttonText1}
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}

            {heroData.buttonText2 && (
              <Link
                to={heroData.buttonLink2 || "/categories"}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                {heroData.buttonText2}
              </Link>
            )}
          </div>

          {/* Bottom Stats Banner */}
          <div className="mt-16 flex items-center gap-8 border-t border-white/15 pt-8 animate-fade-up" style={{ animationDelay: '0.45s' }}>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">50K+</div>
              <div className="text-xs sm:text-sm text-gray-400">Happy Customerssssss</div>
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

        {/* Right Info Overlay Cards */}
        <div className="absolute bottom-12 right-8 hidden animate-float space-y-4 lg:block">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20 text-primary-300">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Free Express Shipping</p>
                <p className="text-xs text-gray-300">On orders over ₹100</p>
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

      {/* Animated scroll cue */}
      <a
        href="#categories"
        aria-label="Scroll to explore"
        className="group absolute bottom-6 left-[43%] z-20 flex -translate-x-1/2 animate-fade-up flex-col items-center gap-3 text-white/80 transition-colors hover:text-white sm:bottom-8"
        style={{ animationDelay: '0.6s' }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
          Scroll to explore
        </span>
        <span className="relative flex h-10 w-[3px] justify-center overflow-hidden rounded-full bg-white/25">
          <span className="absolute left-1/2 top-0 h-3 w-[3px] -translate-x-1/2 rounded-full bg-primary-400 shadow-[0_0_10px_2px_rgba(99,102,241,0.8)] animate-scroll-line" />
        </span>
        <span className="-mt-1 flex flex-col items-center leading-none">
          <ChevronDown className="h-4 w-4 text-white/70 animate-scroll-chevron" style={{ animationDelay: '0s' }} />
          <ChevronDown className="h-4 w-4 text-white/50 animate-scroll-chevron" style={{ animationDelay: '0.18s' }} />
          <ChevronDown className="h-4 w-4 text-white/30 animate-scroll-chevron" style={{ animationDelay: '0.36s' }} />
        </span>
      </a>
    </section>
  );
};