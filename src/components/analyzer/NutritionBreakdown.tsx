import React from 'react';
import { NutritionValues } from '../../types';
import { RadarNutritionChart } from '../common/RadarNutritionChart';

interface NutritionBreakdownProps {
  id?: string;
  nutrition: NutritionValues;
  feedType: string;
}

export const NutritionBreakdown: React.FC<NutritionBreakdownProps> = ({
  id,
  nutrition,
  feedType,
}) => {
  const metrics = [
    {
      label: 'Dry Matter (DM)',
      value: `${nutrition.dryMatter}%`,
      sub: 'Concentrated nutrition solids',
      percent: Math.min(100, (nutrition.dryMatter / 40) * 100),
      color: 'bg-emerald-500',
    },
    {
      label: 'Crude Protein (CP)',
      value: `${nutrition.crudeProtein}%`,
      sub: 'Rumen microbial protein synthesis',
      percent: Math.min(100, (nutrition.crudeProtein / 20) * 100),
      color: 'bg-blue-500',
    },
    {
      label: 'Total Dig. Nutrients (TDN)',
      value: `${nutrition.totalDigestibleNutrients}%`,
      sub: 'Total consumable energy density',
      percent: Math.min(100, (nutrition.totalDigestibleNutrients / 85) * 100),
      color: 'bg-amber-500',
    },
    {
      label: 'Neutral Detergent Fiber (NDF)',
      value: `${nutrition.neutralDetergentFiber}%`,
      sub: 'Bulk & gut fill limitation',
      percent: Math.min(100, (nutrition.neutralDetergentFiber / 70) * 100),
      color: 'bg-stone-500',
    },
    {
      label: 'Acid Detergent Fiber (ADF)',
      value: `${nutrition.acidDetergentFiber}%`,
      sub: 'Indigestible lignocellulose',
      percent: Math.min(100, (nutrition.acidDetergentFiber / 50) * 100),
      color: 'bg-rose-400',
    },
    {
      label: 'Metabolizable Energy (ME)',
      value: `${nutrition.metabolizableEnergy} MJ/kg`,
      sub: 'Bioavailable energy for milk production',
      percent: Math.min(100, (nutrition.metabolizableEnergy / 13) * 100),
      color: 'bg-indigo-500',
    },
    {
      label: 'Calcium (Ca)',
      value: `${nutrition.calcium}%`,
      sub: 'Skeletal & milk calcium secretion',
      percent: Math.min(100, (nutrition.calcium / 1.5) * 100),
      color: 'bg-teal-500',
    },
    {
      label: 'Phosphorus (P)',
      value: `${nutrition.phosphorus}%`,
      sub: 'Metabolic & reproductive fertility',
      percent: Math.min(100, (nutrition.phosphorus / 1.0) * 100),
      color: 'bg-violet-500',
    },
  ];

  return (
    <div
      id={id}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <h4 className="text-base font-bold text-stone-900 dark:text-white">
            Comprehensive Nutritional Spectrum
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Laboratory Dry Matter (DM) calibrated metrics for {feedType.replace('_', ' ')}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar polygonal visualization */}
        <div className="lg:col-span-5 flex justify-center">
          <RadarNutritionChart nutrition={nutrition} size={250} />
        </div>

        {/* Progress bars */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-800/40"
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {m.label}
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-white">
                  {m.value}
                </span>
              </div>
              <div className="h-1.5 w-full bg-stone-200 rounded-full dark:bg-stone-700 overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full ${m.color}`}
                  style={{ width: `${m.percent}%` }}
                />
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                {m.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
