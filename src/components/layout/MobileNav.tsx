import React from 'react';
import { LayoutDashboard, Camera, Flame, Scale, Beef, WifiOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
  id?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenScanner: () => void;
  isOnline?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  id,
  activeTab,
  setActiveTab,
  onOpenScanner,
  isOnline = true,
}) => {
  const { t } = useLanguage();

  return (
    <div
      id={id}
      className="relative md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-900/15 dark:border-emerald-500/20 overflow-hidden shadow-lg bg-white/90 backdrop-blur-md dark:bg-stone-900/90"
    >
      {/* Botanical Organic Leaf Texture Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/leaf_texture.jpg"
          alt="Crop leaves texture"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-25 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs" />
      </div>

      <div className="relative z-10">
      {!isOnline && (
        <div className="flex items-center justify-center gap-1.5 bg-amber-500 py-1 text-[10px] font-bold text-white">
          <WifiOff className="h-3 w-3" />
          <span>Offline Mode — All Calculations & Scans Run Locally</span>
        </div>
      )}
      <div className="flex items-center justify-around px-2 py-2">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('silage')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'silage'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>Silage</span>
        </button>

        {/* Center Floating Scan Button */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-white dark:ring-stone-900 hover:bg-emerald-700 transition-transform active:scale-95"
          title="Scan Feed Now"
        >
          <Camera className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ration')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'ration'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Ration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cattle')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'cattle'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Beef className="h-4 w-4" />
          <span>Herd</span>
        </button>
      </div>
      </div>
    </div>
  );
};
