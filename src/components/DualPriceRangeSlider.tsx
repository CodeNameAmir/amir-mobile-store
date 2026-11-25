import React from 'react';
import { formatToman } from '../utils/storeLogic';

interface DualPriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (nextMin: number, nextMax: number) => void;
}

/**
 * Single-track dual-thumb RTL range slider for selecting a price interval
 * from both minimum (right side in RTL) and maximum (left side in RTL) ends.
 */
export const DualPriceRangeSlider: React.FC<DualPriceRangeSliderProps> = ({
  min,
  max,
  step = 1_000_000,
  minValue,
  maxValue,
  onChange,
}) => {
  const safeMax = Math.max(min + step, max);
  const clampedMin = Math.max(min, Math.min(minValue, maxValue));
  const clampedMax = Math.min(safeMax, Math.max(maxValue, clampedMin));

  const span = safeMax - min;
  const minPercent = span > 0 ? ((clampedMin - min) / span) * 100 : 0;
  const maxPercent = span > 0 ? ((clampedMax - min) / span) * 100 : 100;

  // Raise min thumb above max thumb when near the upper end so user can always drag back down
  const minOnTop = minPercent > 80;

  return (
    <div className="space-y-3" data-testid="dual-price-slider">
      <div className="flex items-center justify-between text-[11px] gap-2">
        <div className="flex flex-col text-right">
          <span className="text-[#576071]">از</span>
          <span className="font-semibold text-[#11161E] tabular-nums-fa">
            {formatToman(clampedMin)} <span className="font-normal text-[#4A5464]">تومان</span>
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[#576071]">تا</span>
          <span className="font-semibold text-[#1453D6] tabular-nums-fa">
            {formatToman(clampedMax)} <span className="font-normal text-[#4A5464]">تومان</span>
          </span>
        </div>
      </div>

      {/* Single unified track with two draggable thumbs (RTL: min starts on right, max on left) */}
      <div className="relative h-7 flex items-center select-none" dir="rtl">
        {/* Base rail */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-[#DCE1E8]" />

        {/* Active selected range segment */}
        <div
          className="absolute h-1.5 rounded-full bg-[#1453D6] transition-[right,width] duration-75"
          style={{
            right: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        />

        {/* Minimum thumb */}
        <input
          type="range"
          dir="rtl"
          data-testid="price-min-slider"
          aria-label="حداقل قیمت به تومان"
          min={min}
          max={safeMax}
          step={step}
          value={clampedMin}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const nextMin = Math.min(raw, clampedMax);
            onChange(nextMin, clampedMax);
          }}
          className={`dual-range-input absolute inset-x-0 w-full ${minOnTop ? 'z-30' : 'z-20'}`}
        />

        {/* Maximum thumb */}
        <input
          type="range"
          dir="rtl"
          data-testid="price-max-slider"
          aria-label="حداکثر قیمت به تومان"
          min={min}
          max={safeMax}
          step={step}
          value={clampedMax}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const nextMax = Math.max(raw, clampedMin);
            onChange(clampedMin, nextMax);
          }}
          className={`dual-range-input absolute inset-x-0 w-full ${minOnTop ? 'z-20' : 'z-30'}`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-normal text-[#576071] tabular-nums-fa">
        <span>ارزان‌ترین ({formatToman(min)})</span>
        <span>گران‌ترین ({formatToman(safeMax)})</span>
      </div>
    </div>
  );
};
