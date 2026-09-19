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

  return (
    <div id={id} className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size * 0.85}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
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
      <div className="absolute top-[42%] flex flex-col items-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
          {clamped}
        </span>
        {label && (
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {label}
          </span>
        )}
      </div>
      {subLabel && (
        <span className="mt-1 text-xs font-medium text-stone-600 dark:text-stone-300">
          {subLabel}
        </span>
      )}
    </div>
  );
};
