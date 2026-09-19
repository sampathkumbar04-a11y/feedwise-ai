import React from 'react';
import { NutritionValues } from '../../types';

interface RadarNutritionChartProps {
  id?: string;
  nutrition: NutritionValues;
  size?: number;
}

export const RadarNutritionChart: React.FC<RadarNutritionChartProps> = ({
  id,
  nutrition,
  size = 240,
}) => {
  const center = size / 2;
  const maxRadius = (size - 60) / 2;

  // 5 key axes normalized to 0 - 100%
  // Dry Matter (typical 30% = 60/100)
  // Crude Protein (typical 10% = 70/100)
  // TDN (typical 65% = 75/100)
  // Fiber Balance (100 - NDF/ADF excess)
  // Energy Density (ME 10 MJ/kg = 75/100)
  const axes = [
    { label: 'DM %', val: Math.min(100, nutrition.dryMatter * 1.5) },
    { label: 'CP %', val: Math.min(100, nutrition.crudeProtein * 4) },
    { label: 'TDN %', val: Math.min(100, nutrition.totalDigestibleNutrients * 1.1) },
    { label: 'Dig. Fiber', val: Math.min(100, (100 - nutrition.acidDetergentFiber) * 1.3) },
    { label: 'Energy ME', val: Math.min(100, nutrition.metabolizableEnergy * 7.5) },
  ];

  const count = axes.length;
  const angleStep = (Math.PI * 2) / count;

  // Generate reference polygon points (70% ideal benchmark)
  const refPoints = axes
    .map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = maxRadius * 0.7;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    })
    .join(' ');

  // Generate sample polygon points
  const samplePoints = axes
    .map((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (maxRadius * (axis.val / 100));
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    })
    .join(' ');

  return (
    <div id={id} className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background concentric rings */}
        {[0.3, 0.6, 0.85, 1.0].map((scale, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={maxRadius * scale}
            fill="none"
            stroke="currentColor"
            className="text-stone-200 dark:text-stone-800"
            strokeWidth="1"
            strokeDasharray={idx < 3 ? '3 3' : undefined}
          />
        ))}

        {/* Axis spokes */}
        {axes.map((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          const textX = center + (maxRadius + 18) * Math.cos(angle);
          const textY = center + (maxRadius + 18) * Math.sin(angle);

          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="currentColor"
                className="text-stone-200 dark:text-stone-800"
                strokeWidth="1"
              />
              <text
                x={textX}
                y={textY + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                className="fill-stone-600 dark:fill-stone-300"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Ideal Benchmark Polygon */}
        <polygon
          points={refPoints}
          fill="rgba(59, 130, 246, 0.08)"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Sample Polygon */}
        <polygon
          points={samplePoints}
          fill="rgba(16, 185, 129, 0.25)"
          stroke="#10b981"
          strokeWidth="2.5"
        />
      </svg>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
          <span className="h-2 w-3 rounded-xs bg-emerald-500"></span> Sample Value
        </span>
        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
          <span className="h-0.5 w-3 border-b-2 border-dashed border-blue-500"></span> Dairy Standard Target
        </span>
      </div>
    </div>
  );
};
