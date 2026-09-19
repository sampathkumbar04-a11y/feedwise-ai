import React from 'react';
import { LayoutDashboard, Camera, Flame, Scale, Beef } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
  id?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenScanner: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  id,
  activeTab,
  setActiveTab,
  onOpenScanner,
}) => {
  const { t } = useLanguage();

  return (
    <div
      id={id}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur-md px-2 py-2 dark:border-stone-800 dark:bg-stone-900/95"
    >
      <div className="flex items-center justify-around">
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
  );
};
