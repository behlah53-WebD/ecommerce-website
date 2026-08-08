import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Timer } from 'lucide-react';
import { useShockingDeal, useShockingDealProducts } from '../../hooks/useQueries';
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
  const { data: deal, isLoading: dealLoading, error: dealError } = useShockingDeal();
  const { data: products = [], isLoading: productsLoading } = useShockingDealProducts(deal);

  const [timeLeft, setTimeLeft] = useState(() => deal ? calculateTimeLeft(deal.endTime) : { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });

  useEffect(() => {
    if (!deal) return;
    const initialTime = calculateTimeLeft(deal.endTime);
    setTimeLeft(initialTime);
  }, [deal]);

  useEffect(() => {
    if (!deal || timeLeft.expired) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(deal.endTime);
      setTimeLeft(remaining);

      if (remaining.expired) {
        clearInterval(interval);
        // Force a re-render to show null by setting expired state
        // The component will naturally return null when timeLeft.expired is true
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deal, timeLeft.expired]);

  if (dealLoading || dealError) {
    return (
      <div className="relative w-full overflow-hidden border-t-4 border-amber-400 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-12 dark:from-black dark:via-gray-950 dark:to-black">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="h-36 w-full animate-pulse rounded-3xl bg-white/5" />
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
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/5 blur-[80px]" />

    <section className="relative z-10 mx-auto max-w-7xl px-4 py-0 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-primary-600 to-indigo-700 p-6 shadow-xl dark:from-sky-950 dark:via-primary-950 dark:to-indigo-950 md:p-8">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
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

          <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-md dark:bg-black/20 md:items-end">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Timer className="h-4 w-4 animate-spin-slow" />
              <span>Hurry Up! Offer Ends In:</span>
            </div>

            <div className="flex items-center gap-2 mt-1">
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

              <div className="flex flex-col items-center">
                <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-900/80 text-lg font-black text-amber-400 shadow-md dark:bg-white/10 dark:text-white sm:h-12 sm:w-14 sm:text-xl">
                  {formatDigit(timeLeft.hours)}
                </span>
                <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-wider">Hours</span>
              </div>

              <span className="text-xl font-bold text-white pb-5">:</span>

              <div className="flex flex-col items-center">
                <span className="flex h-10 w-12 items-center justify-center rounded-lg bg-slate-900/80 text-lg font-black text-amber-400 shadow-md dark:bg-white/10 dark:text-white sm:h-12 sm:w-14 sm:text-xl">
                  {formatDigit(timeLeft.minutes)}
                </span>
                <span className="text-[10px] font-bold text-white mt-1 uppercase tracking-wider">Mins</span>
              </div>

              <span className="text-xl font-bold text-white pb-5">:</span>

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

      <div className="mt-8 pb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
    </div>
  );
};