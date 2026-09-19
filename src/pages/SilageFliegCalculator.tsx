import React, { useState } from 'react';
import { calculateFliegScore } from '../services/fliegScoreCalculator';
import { FliegResult } from '../types';
import { QualityBadge } from '../components/common/QualityBadge';
import { GaugeChart } from '../components/common/GaugeChart';
import { VoiceButton } from '../components/common/VoiceButton';
import { Flame, Sparkles, BookOpen, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';

interface SilageFliegCalculatorProps {
  id?: string;
}

const PRESET_SCENARIOS = [
  {
    name: 'Optimal Corn Silage (Whole Plant)',
    ph: 3.9,
    dm: 34,
    description: '1/2 milk line harvest, packed tightly within 24 hours, homolactic dominant.',
  },
  {
    name: 'Wet Immature Silage (High Seepage)',
    ph: 4.8,
    dm: 22,
    description: 'Cut too early (<25% DM); clostridial risk elevated, seepage effluent losses.',
  },
  {
    name: 'Over-Mature / Dry Silage',
    ph: 4.4,
    dm: 42,
    description: 'Challenging compaction; air pockets foster yeast and mold growth.',
  },
  {
    name: 'Spoiled / Clostridial Silage',
    ph: 5.4,
    dm: 28,
    description: 'Failed preservation; high butyric acid smell and ammonia degradation.',
  },
];

export const SilageFliegCalculator: React.FC<SilageFliegCalculatorProps> = ({ id }) => {
  const [ph, setPh] = useState<number>(3.9);
  const [dryMatter, setDryMatter] = useState<number>(34);

  const result: FliegResult = calculateFliegScore({
    pH: ph,
    dryMatterPercent: dryMatter,
  });

  const voiceText = `Silage Flieg Score calculated as ${result.fliegScore} out of 100, classified as ${result.grade}. Fermentation assessment: ${result.fermentationQualitySummary} Advisory: ${result.feedingAdvisory}`;

  return (
    <div id={id} className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-amber-500" />
            Silage Fermentation & Flieg Score Laboratory
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Standard analytical index developed by Dr. O. Flieg: Index = 220 + (2 × %DM - 15) - 40 × pH
          </p>
        </div>

        <VoiceButton textToRead={voiceText} label="Listen to Analysis" />
      </div>

      {/* Preset Scenarios */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Quick Farm Silage Scenarios
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPh(preset.ph);
                setDryMatter(preset.dm);
              }}
              className="p-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-700"
            >
              <span className="font-bold text-xs text-stone-900 dark:text-white block">
                {preset.name}
              </span>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>pH {preset.ph}</span> • <span>{preset.dm}% DM</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-1 line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls & Live Score Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-600" /> Silage Parameters
            </h3>
            <span className="text-xs text-stone-500">Real-time update</span>
          </div>

          {/* pH Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Silage Acidity (pH)
              </label>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {ph.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="3.4"
              max="6.0"
              step="0.1"
              value={ph}
              onChange={(e) => setPh(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-500 font-medium">
              <span>3.4 (Extreme Acid)</span>
              <span className="text-emerald-600 font-bold">3.8 - 4.2 (Optimal Corn)</span>
              <span className="text-rose-600 font-bold">5.5+ (Putrid)</span>
            </div>
          </div>

          {/* Dry Matter Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                Dry Matter (% DM)
              </label>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {dryMatter}%
              </span>
            </div>
            <input
              type="range"
              min="18"
              max="50"
              step="1"
              value={dryMatter}
              onChange={(e) => setDryMatter(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-500 font-medium">
              <span>18% (Effluent Leaching)</span>
              <span className="text-emerald-600 font-bold">32 - 35% (Ideal)</span>
              <span>50% (Packing Difficulty)</span>
            </div>
          </div>

          {/* Moisture percentage readout */}
          <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 flex justify-between items-center text-xs text-stone-600 dark:text-stone-300">
            <span>Calculated Moisture Content:</span>
            <span className="font-bold text-stone-900 dark:text-white">
              {100 - dryMatter}% Moisture
            </span>
          </div>
        </div>

        {/* Flieg Result Output Panel */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Flieg Fermentation Rating
              </h3>
              <QualityBadge grade={result.grade} size="md" />
            </div>

            <div className="my-4 flex flex-col sm:flex-row items-center gap-6 justify-center">
              <GaugeChart
                value={result.fliegScore}
                label="Flieg Score"
                subLabel={`Grade: ${result.grade}`}
                size={170}
              />

              <div className="space-y-2 text-xs w-full sm:w-auto">
                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] uppercase text-stone-500 block">Lactic Acid (Beneficial)</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {result.lacticAcidPercent}% of total acids
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] uppercase text-stone-500 block">Butyric Acid (Undesirable)</span>
                  <span className={`text-base font-bold ${result.butyricAcidPercent > 5 ? 'text-rose-600' : 'text-stone-700 dark:text-stone-300'}`}>
                    {result.butyricAcidPercent}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] uppercase text-stone-500 block">Ammonia Nitrogen (NH3-N)</span>
                  <span className="text-base font-bold text-stone-800 dark:text-stone-200">
                    {result.ammoniaNitrogenPercent}% of total N
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 text-xs">
            <p className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              Fermentation Advisory:
            </p>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {result.fermentationQualitySummary}
            </p>
            <p className="mt-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
              💡 {result.feedingAdvisory}
            </p>
          </div>
        </div>
      </div>

      {/* Flieg Scientific Scale Reference Table */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <h3 className="text-base font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-600" /> Flieg Score Reference Standard
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400">
                <th className="pb-2 font-semibold">Flieg Index</th>
                <th className="pb-2 font-semibold">Quality Grade</th>
                <th className="pb-2 font-semibold">Fermentation Characteristics</th>
                <th className="pb-2 font-semibold">Dairy Feeding Safety</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                <td className="py-2.5 font-bold text-emerald-600">81 - 100</td>
                <td className="py-2.5 font-semibold">Very Good</td>
                <td className="py-2.5 text-stone-600 dark:text-stone-300">Predominantly lactic acid, trace butyric, pleasant aromatic smell, pH 3.8 - 4.2</td>
                <td className="py-2.5 text-emerald-600 font-medium">Safe for high yielders & calves; maximum intake</td>
              </tr>
              <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                <td className="py-2.5 font-bold text-teal-600">61 - 80</td>
                <td className="py-2.5 font-semibold">Good</td>
                <td className="py-2.5 text-stone-600 dark:text-stone-300">Adequate lactic acid, mild acetic notes, sound preservation, pH 4.2 - 4.5</td>
                <td className="py-2.5 text-stone-700 dark:text-stone-300 font-medium">Good for all lactating dairy cows</td>
              </tr>
              <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                <td className="py-2.5 font-bold text-amber-600">41 - 60</td>
                <td className="py-2.5 font-semibold">Fair</td>
                <td className="py-2.5 text-stone-600 dark:text-stone-300">Moderate lactic acid, higher acetic acid, delayed compaction, pH 4.5 - 4.8</td>
                <td className="py-2.5 text-stone-600 dark:text-stone-400">Feed to dry cows or heifers; mix with dry fodder</td>
              </tr>
              <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                <td className="py-2.5 font-bold text-orange-600">21 - 40</td>
                <td className="py-2.5 font-semibold">Poor</td>
                <td className="py-2.5 text-stone-600 dark:text-stone-300">Butyric acid detected, ammonia-N &gt; 12%, clostridial degradation, pH 4.8 - 5.3</td>
                <td className="py-2.5 text-rose-600 font-medium">Do NOT feed to pregnant cows or calves</td>
              </tr>
              <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                <td className="py-2.5 font-bold text-rose-600">0 - 20</td>
                <td className="py-2.5 font-semibold">Very Poor</td>
                <td className="py-2.5 text-stone-600 dark:text-stone-300">Failed silage, putrid smell, slimy texture, high volatile acids, pH &gt; 5.3</td>
                <td className="py-2.5 text-rose-700 font-bold">Hazardous: Discard batch; ketosis & listeriosis hazard</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
