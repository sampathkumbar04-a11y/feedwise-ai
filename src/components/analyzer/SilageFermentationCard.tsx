import React, { useState } from 'react';
import { FliegResult } from '../../types';
import { calculateFliegScore } from '../../services/fliegScoreCalculator';
import { QualityBadge } from '../common/QualityBadge';
import { GaugeChart } from '../common/GaugeChart';
import { Sparkles, Sliders, CheckCircle, AlertCircle } from 'lucide-react';

interface SilageFermentationCardProps {
  id?: string;
  initialFliegData?: FliegResult;
}

export const SilageFermentationCard: React.FC<SilageFermentationCardProps> = ({
  id,
  initialFliegData,
}) => {
  const [pH, setPH] = useState<number>(initialFliegData?.pH ?? 3.9);
  const [dryMatter, setDryMatter] = useState<number>(initialFliegData?.dryMatter ?? 33);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const activeResult: FliegResult = isCustomMode
    ? calculateFliegScore({ pH, dryMatterPercent: dryMatter })
    : initialFliegData || calculateFliegScore({ pH: 3.9, dryMatterPercent: 33 });

  return (
    <div
      id={id}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">
              Silage Fermentation & Flieg Score
            </h3>
            <QualityBadge grade={activeResult.grade} size="md" />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Standard scientific index: Score = 220 + (2 × DM% - 15) - 40 × pH
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomMode(!isCustomMode)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
          <Sliders className="h-3.5 w-3.5 text-emerald-600" />
          {isCustomMode ? 'Reset to Analysis' : 'Interactive pH & DM Simulator'}
        </button>
      </div>

      {isCustomMode && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Live Flieg Score Simulator
            </span>
            <span className="text-xs text-stone-500">Adjust sliders to see quality impact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Measured Silage pH</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{pH.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="3.4"
                max="6.0"
                step="0.1"
                value={pH}
                onChange={(e) => setPH(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                <span>3.4 (High Acid)</span>
                <span>3.8 - 4.2 (Optimal)</span>
                <span>6.0 (Spoiled)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Dry Matter (DM %)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{dryMatter}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                step="1"
                value={dryMatter}
                onChange={(e) => setDryMatter(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                <span>20% (Too wet, seepage)</span>
                <span>32-35% (Ideal)</span>
                <span>50% (Too dry)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Gauge Chart */}
        <div className="flex flex-col items-center justify-center p-2">
          <GaugeChart
            value={activeResult.fliegScore}
            label="Flieg Score"
            subLabel={`Rating: ${activeResult.grade}`}
            size={180}
          />
        </div>

        {/* Fermentation Acid Balance & Metrics */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span>Volatile Fatty Acid & Fermentation Spectrum</span>
              <span>Lactic / Acetic / Butyric</span>
            </div>

            {/* Stacked acid bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-stone-200 dark:bg-stone-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${activeResult.lacticAcidPercent}%` }}
                title={`Lactic Acid: ${activeResult.lacticAcidPercent}%`}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${activeResult.aceticAcidPercent}%` }}
                title={`Acetic Acid: ${activeResult.aceticAcidPercent}%`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${activeResult.butyricAcidPercent}%` }}
                title={`Butyric Acid: ${activeResult.butyricAcidPercent}%`}
              />
            </div>

            <div className="flex justify-between text-[11px] text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Lactic: {activeResult.lacticAcidPercent}%
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span> Acetic: {activeResult.aceticAcidPercent}%
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span> Butyric: {activeResult.butyricAcidPercent}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-2.5 border border-stone-200/70 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Silage pH</span>
              <span className="text-base font-bold text-stone-900 dark:text-white">{activeResult.pH}</span>
              <span className="text-[10px] text-stone-400 block">Target: 3.8 - 4.2</span>
            </div>

            <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-2.5 border border-stone-200/70 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Ammonia Nitrogen</span>
              <span className="text-base font-bold text-stone-900 dark:text-white">{activeResult.ammoniaNitrogenPercent}% N</span>
              <span className="text-[10px] text-stone-400 block">&lt; 10% is Safe</span>
            </div>

            <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-2.5 border border-stone-200/70 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Aerobic Stability</span>
              <span className="text-base font-bold text-stone-900 dark:text-white">{activeResult.aerobicStabilityHours} Hours</span>
              <span className="text-[10px] text-stone-400 block">Resistance to heating</span>
            </div>
          </div>

          <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 border border-stone-200/70 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300">
            <p className="font-semibold text-stone-900 dark:text-white mb-0.5">
              Fermentation Assessment:
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-300 mb-1.5">
              {activeResult.fermentationQualitySummary}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              💡 {activeResult.feedingAdvisory}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
