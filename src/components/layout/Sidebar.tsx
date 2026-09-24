import React from 'react';
import {
  LayoutDashboard,
  Camera,
  ShieldAlert,
  Flame,
  Scale,
  Beef,
  CloudSun,
  FileCheck,
  Building2,
  Sprout,
  Leaf,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  id?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  id,
  activeTab,
  setActiveTab,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'analyzer', label: t('feedAnalyzer'), icon: Camera },
    { id: 'safety', label: t('feedSafetyScanner'), icon: ShieldAlert },
    { id: 'silage', label: t('silageAnalyzer'), icon: Flame },
    { id: 'ration', label: t('rationPlanner'), icon: Scale },
    { id: 'cattle', label: t('cattleManager'), icon: Beef },
    { id: 'weather', label: t('weatherAdvisor'), icon: CloudSun },
    { id: 'reports', label: t('reports'), icon: FileCheck },
    { id: 'cooperative', label: t('coopPortal'), icon: Building2 },
  ];

  return (
    <aside
      id={id}
      data-lenis-prevent
      className="relative hidden md:flex w-64 flex-col justify-between border-r border-emerald-900/10 dark:border-emerald-500/20 shrink-0 sticky top-16 h-[calc(100vh-4rem)] self-start overflow-hidden shadow-xs"
    >
      {/* Botanical Organic Leaf Texture Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/sidebar_leaf.jpg"
          alt="Organic crop leaves texture"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center scale-105 opacity-30 dark:opacity-20 transition-opacity duration-500"
        />
        {/* Frosted glass veil to ensure high readability and contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-emerald-50/80 to-white/90 dark:from-stone-950/90 dark:via-emerald-950/80 dark:to-stone-950/90 backdrop-blur-[3px]" />
        {/* Subtle leaf border accent line */}
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-emerald-500/30 via-emerald-400/20 to-transparent" />
      </div>

      {/* Navigation items layer */}
      <div className="relative z-10 space-y-1 p-4 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 dark:text-emerald-300/70 flex items-center gap-1.5">
          <Leaf className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>Farm Modules</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 backdrop-blur-xs'
                  : 'text-stone-700 hover:bg-emerald-600/10 hover:text-emerald-900 dark:text-stone-200 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-700/70 dark:text-emerald-400/70'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Status / Farm Banner */}
      <div className="relative z-10 p-4 pt-0">
        <div className="rounded-xl border border-emerald-200/80 bg-white/80 p-3 shadow-xs dark:border-emerald-900/60 dark:bg-stone-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-semibold text-stone-900 dark:text-white truncate flex items-center gap-1">
              <Sprout className="h-3 w-3 text-emerald-600 shrink-0" />
              {user.farmOrOrgName}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 capitalize">
            Role: {user.role} ({user.district})
          </p>
        </div>
      </div>
    </aside>
  );
};
