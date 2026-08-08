import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());

  renderCount.current++;
  const now = performance.now();
  const timeSinceLastRender = now - lastRenderTime.current;
  const timeSinceMount = now - mountTime.current;
  lastRenderTime.current = now;

  useEffect(() => {
    return () => {
      if (import.meta.env.DEV) {
        console.log(`[Perf] ${componentName} unmounted - Total renders: ${renderCount.current}, Mount time: ${timeSinceMount.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  if (import.meta.env.DEV && renderCount.current > 10) {
    console.warn(`[Perf] ${componentName} has rendered ${renderCount.current} times (${timeSinceLastRender.toFixed(2)}ms since last render)`);
  }

  return {
    renderCount: renderCount.current,
    timeSinceMount,
    timeSinceLastRender,
  };
};

export const measureAsync = async (label, fn) => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    if (import.meta.env.DEV) {
      console.log(`[Perf] ${label} took ${duration.toFixed(2)}ms`);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    if (import.meta.env.DEV) {
      console.error(`[Perf] ${label} failed after ${duration.toFixed(2)}ms:`, error);
    }
    throw error;
  }
};