import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Flame,
  Scale,
  Beef,
  CloudSun,
  FileCheck,
  Building2,
  Stethoscope,
  BookOpen,
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
    { id: 'silage', label: t('silageAnalyzer'), icon: Flame },
    { id: 'ration', label: t('rationPlanner'), icon: Scale },
    { id: 'cattle', label: t('cattleManager'), icon: Beef },
    { id: 'weather', label: t('weatherAdvisor'), icon: CloudSun },
    { id: 'reports', label: t('reports'), icon: FileCheck },
    { id: 'cooperative', label: t('coopPortal'), icon: Building2 },
    { id: 'vet', label: t('vetPortal'), icon: Stethoscope },
  ];

  return (
    <aside
      id={id}
      className="hidden md:flex w-64 flex-col justify-between border-r border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/60 shrink-0"
    >
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Main Navigation
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
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800/80'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Status / Farm Banner */}
      <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-semibold text-stone-900 dark:text-white truncate">
            {user.farmOrOrgName}
          </span>
        </div>
        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 capitalize">
          Role: {user.role} ({user.district})
        </p>
      </div>
    </aside>
  );
};
