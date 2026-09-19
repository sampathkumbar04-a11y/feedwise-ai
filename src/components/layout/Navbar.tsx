import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Language } from '../../data/translations';
import {
  Sun,
  Moon,
  Globe,
  UserCheck,
  Camera,
  Bot,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  id?: string;
  onOpenScanner: () => void;
  onOpenChat: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  id,
  onOpenScanner,
  onOpenChat,
  activeTab,
  setActiveTab,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, setRole } = useAuth();

  const roleLabels: Record<UserRole, string> = {
    farmer: 'Dairy Farmer (किसान)',
    cooperative: 'Milk Union (सहकारी)',
    veterinarian: 'Veterinarian (पशु चिकित्सक)',
    admin: 'Central Operations',
  };

  return (
    <header
      id={id}
      className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-xs text-white">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-white">
                FeedWise <span className="text-emerald-600 dark:text-emerald-400">AI</span>
              </span>
              <span className="rounded-sm bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PRO
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-stone-500 dark:text-stone-400">
              Silage Quality & Cattle Ration Precision
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Assistant Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Kisan Sahayak</span>
          </button>

          {/* Scan Feed Primary CTA */}
          <button
            type="button"
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 sm:px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Camera className="h-4 w-4" />
            <span>Scan Feed</span>
          </button>

          {/* Role Switcher */}
          <div className="relative hidden md:block">
            <select
              value={user.role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 cursor-pointer focus:outline-hidden"
              title="Switch user perspective"
            >
              <option value="farmer">Farmer: {user.farmOrOrgName}</option>
              <option value="cooperative">Coop: Milk Union Officer</option>
              <option value="veterinarian">Veterinary Clinician</option>
              <option value="admin">Operations Admin</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 cursor-pointer focus:outline-hidden"
              title="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
