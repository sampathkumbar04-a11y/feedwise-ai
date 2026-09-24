import React from 'react';

interface GaugeChartProps {
  id?: string;
  value: number; // 0 to 100
  label?: string;
  subLabel?: string;
  size?: number;
  strokeWidth?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  id,
  value,
  label,
  subLabel,
  size = 180,
  strokeWidth = 14,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  let strokeColor = '#10b981'; // emerald
  if (clamped < 45) strokeColor = '#ef4444'; // rose
  else if (clamped < 65) strokeColor = '#f59e0b'; // amber
  else if (clamped < 80) strokeColor = '#14b8a6'; // teal

  const gaugeHeight = Math.round(size * 0.85);

  return (
    <div
      id={id}
      className="relative inline-flex flex-col items-center justify-center select-none"
      style={{ width: size }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: gaugeHeight }}
      >
        <svg
          width={size}
          height={gaugeHeight}
          viewBox={`0 0 ${size} ${gaugeHeight}`}
          className="overflow-visible"
        >
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-stone-200 dark:text-stone-800"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />
          {/* Active Value Arc (Green Line / Progress Arc) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Centered Score & Metric Label inside the gauge arc */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
          style={{ paddingTop: `${Math.round(size * 0.04)}px` }}
        >
          <span className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-none">
            {clamped}
          </span>
          {label && (
            <span className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 max-w-[130px] leading-tight text-center px-1">
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Sublabel (Quality Grade / Status) below the gauge */}
      {subLabel && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {subLabel}
          </span>
        </div>
      )}
    </div>
  );
};
