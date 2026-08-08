import React, { useEffect, useRef, useState } from 'react';

const clamp = (min, max, value) => Math.min(max, Math.max(min, value));

export const PriceRangeSlider = ({
  min = 0,
  max = 1000,
  step = 1,
  value,
  onCommit,
  className = '',
}) => {
  const [minVal, setMinVal] = useState(() =>
    clamp(min, max, value?.[0] ?? min),
  );
  const [maxVal, setMaxVal] = useState(() =>
    clamp(min, max, value?.[1] ?? max),
  );

  const trackRef = useRef(null);
  const draggingRef = useRef(null);
  const liveRef = useRef([minVal, maxVal]);
  const onCommitRef = useRef(onCommit);

  liveRef.current = [minVal, maxVal];
  onCommitRef.current = onCommit;

  const valueToPct = (v) =>
    ((clamp(min, max, v) - min) / (max - min)) * 100;

  const positionFromClientX = (clientX) => {
    const track = trackRef.current;
    if (!track) return null;
    const { left, width } = track.getBoundingClientRect();
    const ratio = (clientX - left) / width;
    const raw = min + ratio * (max - min);
    return clamp(min, max, Math.round(raw / step) * step);
  };

  const handlePointerDown = (which) => (e) => {
    draggingRef.current = which;
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const pos = positionFromClientX(e.clientX);
    if (pos === null) return;
    const [curMin, curMax] = liveRef.current;
    if (draggingRef.current === 'min') {
      setMinVal(clamp(min, curMax, pos));
    } else {
      setMaxVal(clamp(curMin, max, pos));
    }
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = null;
    if (onCommitRef.current) onCommitRef.current(liveRef.current);
  };

  const handleKeyDown = (which) => (e) => {
    const delta = e.shiftKey ? 10 * step : step;
    const [curMin, curMax] = liveRef.current;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (which === 'min') next = [clamp(min, curMax, curMin + delta), curMax];
      else next = [curMin, clamp(curMin, max, curMax + delta)];
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (which === 'min') next = [clamp(min, curMax, curMin - delta), curMax];
      else next = [curMin, clamp(curMin, max, curMax - delta)];
    }
    if (next) {
      setMinVal(next[0]);
      setMaxVal(next[1]);
      if (onCommitRef.current) onCommitRef.current(next);
    }
  };

  const handleBlur = () => {
    if (draggingRef.current) return;
    if (onCommitRef.current) onCommitRef.current(liveRef.current);
  };

  useEffect(() => {
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    setMinVal(clamp(min, max, value?.[0] ?? min));
    setMaxVal(clamp(min, max, value?.[1] ?? max));
  }, [value, min, max]);

  const minPct = valueToPct(minVal);
  const maxPct = valueToPct(maxVal);
  const fillWidth = Math.max(0, maxPct - minPct);

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={trackRef}
        className="relative h-6"
        role="group"
        aria-label="Price range"
      >
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary-500"
          style={{ left: `${minPct}%`, width: `${fillWidth}%` }}
        />
        <div
          role="slider"
          aria-label="Minimum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={minVal}
          tabIndex={0}
          onPointerDown={handlePointerDown('min')}
          onKeyDown={(e) => handleKeyDown('min')(e)}
          onBlur={handleBlur}
          className="absolute top-1/2 -left-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 bg-primary-600 shadow focus:outline-none focus:ring-2 focus:ring-primary-400"
          style={{ left: `${minPct}%` }}
        />
        <div
          role="slider"
          aria-label="Maximum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={maxVal}
          tabIndex={0}
          onPointerDown={handlePointerDown('max')}
          onKeyDown={(e) => handleKeyDown('max')(e)}
          onBlur={handleBlur}
          className="absolute top-1/2 -left-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 bg-primary-600 shadow focus:outline-none focus:ring-2 focus:ring-primary-400"
          style={{ left: `${maxPct}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>${min}</span>
        <span>${max}</span>
      </div>
      <div className="mt-1 flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>Min: ${minVal}</span>
        <span>Max: ${maxVal}</span>
      </div>
    </div>
  );
};

PriceRangeSlider.displayName = 'PriceRangeSlider';

export default PriceRangeSlider;