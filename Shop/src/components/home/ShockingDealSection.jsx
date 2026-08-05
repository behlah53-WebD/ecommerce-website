import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Timer } from 'lucide-react';
import { getProducts, getActiveShockingDealCached, clearShockingDealCache } from '../../api/productService';
import { ProductCard } from '../products/ProductCard';

const calculateTimeLeft = (endTimeStr) => {
  const difference = +new Date(endTimeStr) - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: true,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  return timeLeft;
};

export const ShockingDealSection = () => {
  const [deal, setDeal] = useState(null);
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
  const [loading, setLoading] = useState(true);

  const fetchDealData = useCallback(async () => {
    try {
      const activeDeal = await getActiveShockingDealCached();
      if (!activeDeal) {
        setDeal(null);
        setLoading(false);
        return;
      }

      // Check timer expiration
      const initialTime = calculateTimeLeft(activeDeal.endTime);
      if (initialTime.expired) {
        clearShockingDealCache();
        setDeal(null);
        setLoading(false);
        return;
      }

      setDeal(activeDeal);
      setTimeLeft(initialTime);

      // Fetch all products (normalizer automatically applies active deal discounts)
      const productsRes = await getProducts();
      const allProducts = productsRes.products || [];

      // Filter products belonging to this deal
      const dealProductIds = new Set((activeDeal.products || []).map((p) => String(p.productId)));
      const filtered = allProducts.filter((p) => dealProductIds.has(String(p.id)));
      
      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching shocking deal storefront data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDealData();
  }, [fetchDealData]);

  // Countdown timer logic
  useEffect(() => {
    if (!deal || timeLeft.expired) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(deal.endTime);
      setTimeLeft(remaining);

      if (remaining.expired) {
        clearInterval(interval);
        clearShockingDealCache();
        setDeal(null);
        // Force state refresh across the website to revert pricing
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deal, timeLeft.expired]);

  if (loading) {
    return (
      <div className="relative w-full overflow-hidden border-t-4 border-amber-400 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-12 dark:from-black dark:via-gray-950 dark:to-black">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Skeleton banner */}
          <div className="h-36 w-full animate-pulse rounded-3xl bg-white/5" />
          {/* Skeleton product cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!deal || timeLeft.expired || products.length === 0) {
    return null;
  }

  const formatDigit = (num) => String(num).padStart(2, '0');

  return (
    <div className="relative w-full overflow-hidden border-t-4 border-amber-400 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-12 shadow-[0_-4px_30px_rgba(251,191,36,0.15)] dark:from-black dark:via-gray-950 dark:to-black">
      {/* Full section background glow accents */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-[80px]" />

    <section className="relative z-10 mx-auto max-w-7xl px-4 py-0 lg:px-8">
      {/* Banner Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-primary-600 to-indigo-700 p-6 shadow-xl dark:from-sky-950 dark:via-primary-950 dark:to-indigo-950 md:p-8">
        {/* Banner Glow Background Decoration */}
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          {/* Header Title Left */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 animate-bounce items-center justify-center rounded-2xl bg-amber-400 text-primary-950 shadow-lg">
              <Zap className="h-8 w-8 fill-primary-950 stroke-primary-950" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl uppercase">
                {deal.title}
              </h2>
              <p className="mt-1 text-sm text-sky-100 dark:text-sky-200">
                {deal.subtitle}
              </p>
            </div>
          </div>

          {/* Countdown Clock Right */}
          <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-md dark:bg-black/20 md:items-end">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Timer className="h-4 w-4 animate-spin-slow" />
              <span>Hurry Up! Offer Ends In:</span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {/* Days */}
              {timeLeft.days > 0 && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-amber-400 text-lg font-black text-slate-900 shadow-md sm:h-12 sm:w-14 sm:text-xl">
                      {formatDigit(timeLeft.days)}
                    </span>
                    <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-wider">Days</span>
                  </div>
                  <span className="text-xl font-bold text-white pb-5">:</span>
                </>
              )}

              {/* Hours */}
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-900/80 text-lg font-black text-amber-400 shadow-md dark:bg-white/10 dark:text-white sm:h-12 sm:w-14 sm:text-xl">
                  {formatDigit(timeLeft.hours)}
                </span>
                <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-wider">Hours</span>
              </div>

              <span className="text-xl font-bold text-white pb-5">:</span>

              {/* Mins */}
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-900/80 text-lg font-black text-amber-400 shadow-md dark:bg-white/10 dark:text-white sm:h-12 sm:w-14 sm:text-xl">
                  {formatDigit(timeLeft.minutes)}
                </span>
                <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-wider">Mins</span>
              </div>

              <span className="text-xl font-bold text-white pb-5">:</span>

              {/* Secs */}
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-amber-500 text-lg font-black text-slate-950 shadow-md sm:h-12 sm:w-14 sm:text-xl animate-pulse">
                  {formatDigit(timeLeft.seconds)}
                </span>
                <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-wider">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mt-8 pb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
    </div>
  );
};
