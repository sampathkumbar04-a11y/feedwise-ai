import React, { useState } from 'react';
import { useAgriTheme, AgriScenery, AgriIntensity } from '../../context/AgriThemeContext';
import { Sprout, Wheat, Sparkles, SlidersHorizontal, Check, Eye } from 'lucide-react';

interface AgriBackgroundProps {
  id?: string;
}

export const AgriBackground: React.FC<AgriBackgroundProps> = ({ id }) => {
  const {
    scenery,
    setScenery,
    intensity,
    setIntensity,
    showFurrows,
    setShowFurrows,
  } = useAgriTheme();

  const [isControlOpen, setIsControlOpen] = useState(false);

  // Compute overlay opacities based on intensity
  const lightOverlayClass =
    intensity === 'vibrant'
      ? 'from-emerald-950/10 via-stone-50/60 to-stone-50/75 backdrop-blur-[0.5px]'
      : intensity === 'subtle'
      ? 'from-stone-50/75 via-stone-50/85 to-stone-50/92 backdrop-blur-[2px]'
      : 'from-emerald-950/15 via-stone-50/65 to-stone-50/82 backdrop-blur-[1px]';

  const darkOverlayClass =
    intensity === 'vibrant'
      ? 'from-stone-950/70 via-emerald-950/65 to-stone-950/85 backdrop-blur-[0.5px]'
      : intensity === 'subtle'
      ? 'from-stone-950/85 via-stone-950/90 to-stone-950/96 backdrop-blur-[2px]'
      : 'from-stone-950/78 via-emerald-950/75 to-stone-950/90 backdrop-blur-[1px]';

  return (
    <>
      {/* FIXED BACKGROUND CANOPY */}
      <div
        id={id}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      >
        {/* Layer 1: Scenic Farmer & Dairy Cows Pasture Landscapes with Crossfade */}
        <div className="absolute inset-0 w-full h-full">
          {/* Farmer & Dairy Cows in Lush Green Pasture */}
          <img
            src="/farmer_cows_pasture.jpg"
            alt="Dairy farmer caring for healthy dairy cows grazing in lush green pastures"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 transform scale-[1.01] ${
              scenery === 'lush-pasture' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Farmer Feeding Cattle Herd in Agricultural Fields */}
          <img
            src="/farmer_cattle_herd.jpg"
            alt="Farmer feeding nutritious silage fodder to dairy cattle herd in open agricultural fields"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 transform scale-[1.01] ${
              scenery === 'golden-harvest' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Layer 2: Sunbeam Warmth and Natural Farm Atmosphere */}
        <div className="absolute inset-0 bg-radial-[ellipse_at_top_right] from-amber-400/20 via-emerald-500/10 to-transparent dark:from-amber-500/10 dark:via-emerald-900/15 dark:to-transparent" />

        {/* Layer 3: Dynamic Adaptive Gradient Overlay for Maximum Readability */}
        <div
          className={`absolute inset-0 bg-gradient-to-b transition-colors duration-500 ${lightOverlayClass} dark:${darkOverlayClass}`}
        />

        {/* Layer 4: Optional Topographic Farm Furrow Micro-Pattern */}
        {showFurrows && (
          <div className="absolute inset-0 opacity-40 dark:opacity-25 agri-topo-pattern" />
        )}

        {/* Layer 5: Soft Vignette Edge Softener */}
        <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-transparent to-stone-900/15 dark:to-black/40 pointer-events-none" />
      </div>

      {/* FLOATING AGRICULTURE SCENERY SWITCHER (Non-intrusive bottom-right pill) */}
      <div className="fixed bottom-4 right-4 z-30 hidden md:block">
        <div className="relative">
          {isControlOpen && (
            <div className="absolute bottom-12 right-0 w-72 rounded-2xl border border-stone-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 transition-all text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                  <Sprout className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Agricultural Canvas</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsControlOpen(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  ✕
                </button>
              </div>

              {/* Scenery Selector */}
              <div className="mt-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Farmer & Cattle Scenery
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScenery('lush-pasture')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                      scenery === 'lush-pasture'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                        : 'border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Sprout className="h-4 w-4 text-emerald-600" />
                    <span>Farmer & Cows</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScenery('golden-harvest')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                      scenery === 'golden-harvest'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold ring-1 ring-amber-500'
                        : 'border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Wheat className="h-4 w-4 text-amber-500" />
                    <span>Herd Feeding</span>
                  </button>
                </div>
              </div>

              {/* Intensity Selector */}
              <div className="mt-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Background Focus
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['subtle', 'balanced', 'vibrant'] as AgriIntensity[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIntensity(level)}
                      className={`capitalize py-1.5 rounded-lg border text-center transition-all ${
                        intensity === level
                          ? 'border-emerald-500 bg-emerald-500 text-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Furrow Lines */}
              <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <span className="text-[11px] text-stone-600 dark:text-stone-400">
                  Farm Furrow Grid
                </span>
                <button
                  type="button"
                  onClick={() => setShowFurrows(!showFurrows)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    showFurrows ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                      showFurrows ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsControlOpen(!isControlOpen)}
            className="flex items-center gap-2 rounded-full border border-stone-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-stone-700 shadow-md backdrop-blur-md hover:bg-white hover:border-emerald-500 hover:text-emerald-700 dark:border-stone-700/80 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:border-emerald-500 transition-all"
            title="Customize Agricultural Background"
          >
            {scenery === 'lush-pasture' ? (
              <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Wheat className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            )}
            <span className="capitalize font-medium">
              {scenery === 'lush-pasture' ? 'Farmer & Cows' : 'Herd Feeding'}
            </span>
            <SlidersHorizontal className="h-3 w-3 opacity-60 ml-0.5" />
          </button>
        </div>
      </div>
    </>
  );
};
