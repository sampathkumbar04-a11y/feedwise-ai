import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { QualityBadge } from '../components/common/QualityBadge';
import {
  Flame,
  Droplet,
  IndianRupee,
  CloudSun,
  Camera,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Leaf,
  Sprout,
} from 'lucide-react';

interface DashboardProps {
  id?: string;
  onOpenScanner: () => void;
  onOpenChat: () => void;
  setActiveTab: (tab: string) => void;
  onViewReport: (reportId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  id,
  onOpenScanner,
  onOpenChat,
  setActiveTab,
  onViewReport,
}) => {
  const { cattleList, scanReports, weatherStatus } = useAppData();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Compute metrics
  const silageScans = scanReports.filter((r) => r.feedType === 'silage' && r.fliegData);
  const avgFliegScore =
    silageScans.length > 0
      ? Math.round(
          silageScans.reduce((s, r) => s + (r.fliegData?.fliegScore || 0), 0) /
            silageScans.length
        )
      : 86;

  const totalMilk = cattleList.reduce((s, c) => s + c.dailyMilkYieldLiters, 0);
  const avgMilk = cattleList.length > 0 ? +(totalMilk / cattleList.length).toFixed(1) : 15;

  return (
    <div id={id} className="space-y-6">
      {/* Welcome & Quick Action Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-800 to-stone-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs border border-emerald-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Dairy Agronomy & Silage Optimization</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Monitor real-time silage fermentation, analyze feed crude protein via spectrometry, and optimize balanced rations to maximize milk yield while minimizing cost per liter.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-emerald-400 transition-colors shadow-xs"
            >
              <Camera className="h-4 w-4" />
              {t('scanNow')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('silage')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors backdrop-blur-xs border border-white/15"
            >
              <Flame className="h-4 w-4 text-amber-400" />
              {t('calculateFlieg')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('safety')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors backdrop-blur-xs border border-white/15"
            >
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              Feed Safety Scanner
            </button>
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-colors border border-amber-400/30"
            >
              <Sparkles className="h-4 w-4" />
              Kisan Sahayak Chat
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Silage Flieg Score"
          value={`${avgFliegScore} / 100`}
          subtitle="Very Good Fermentation Grade"
          icon={Flame}
          color="emerald"
          trend={{ value: '+4 pts vs last batch', positive: true }}
        />
        <StatCard
          title="Herd Daily Milk"
          value={`${totalMilk.toFixed(0)} Liters`}
          subtitle={`Avg ${avgMilk}L per animal across ${cattleList.length} head`}
          icon={Droplet}
          color="blue"
          trend={{ value: '+1.2L with Corn Silage', positive: true }}
        />
        <StatCard
          title="Average Feed Cost"
          value="₹19.4 / L"
          subtitle="Target threshold: < ₹22 / L"
          icon={IndianRupee}
          color="amber"
          trend={{ value: '-₹2.1/L least-cost ration', positive: true }}
        />
        <StatCard
          title="Heat Stress (THI)"
          value={`${weatherStatus.thiIndex} THI`}
          subtitle={`${weatherStatus.heatStressLevel} (${weatherStatus.temperatureC}°C, ${weatherStatus.humidityPercent}%)`}
          icon={CloudSun}
          color={weatherStatus.heatStressLevel === 'Normal' ? 'emerald' : 'rose'}
        />
      </div>

      {/* Main 2-column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Feed Quality Inspections */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Recent Feed & Silage Quality Audits
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  AI Computer Vision spectrometry reports
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
              >
                View all logs <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
              {scanReports.slice(0, 3).map((report) => (
                <div
                  key={report.id}
                  onClick={() => onViewReport(report.id)}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 dark:hover:bg-stone-800/30 rounded-xl px-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={report.imageUrl}
                      alt={report.sampleName}
                      className="h-12 w-12 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-white">
                          {report.sampleName}
                        </span>
                        <QualityBadge grade={report.qualityGrade} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                        <span>DM: {report.nutritionalValues.dryMatter}%</span>
                        <span>CP: {report.nutritionalValues.crudeProtein}%</span>
                        <span>TDN: {report.nutritionalValues.totalDigestibleNutrients}%</span>
                        {report.fliegData && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Flieg: {report.fliegData.fliegScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-stone-900 dark:text-white">
                        {report.overallScore}
                      </span>
                      <span className="text-[10px] text-stone-400 block">/ 100 Quality</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-stone-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Flieg Score & Fermentation Teaser */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-500" />
                  Silage Fermentation & Bunker Compaction Protocol
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Homolactic preservation suppresses clostridia, preserves true protein, and avoids secondary heating.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('silage')}
                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                Open Calculator
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  1. Target Moisture
                </span>
                <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                  Harvest whole corn at 65-68% moisture (32-35% DM). If too wet (&gt;72%), clostridial butyric acid risk triples.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  2. Rapid Acidification
                </span>
                <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                  Drive pH under 4.2 within 4 days. Homolactic bacteria convert soluble sugars into preservative lactic acid.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  3. Bunker Face Cut
                </span>
                <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                  Unload vertically at minimum 15cm per day to prevent aerobic exposure, yeast reheating, and mold hyphae.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Herd Status & Weather Risk (Side Section with Botanical Leaf Background) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weather & THI Card with Organic Leaf Background */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-900/15 dark:border-emerald-500/25 shadow-xs group">
            {/* Relatable Agricultural Leaf Background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <img
                src="/leaf_texture.jpg"
                alt="Agricultural crop leaves"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center scale-105 opacity-35 dark:opacity-25 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-emerald-50/90 dark:from-stone-900/90 dark:via-stone-900/85 dark:to-emerald-950/90 backdrop-blur-[2px]" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
            </div>

            <div className="relative z-10 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10 dark:border-emerald-500/15">
                <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                  <CloudSun className="h-4 w-4 text-amber-500" />
                  <span>Farm Climate & THI</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Leaf className="h-2.5 w-2.5 text-emerald-600" />
                    Live Field
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('weather')}
                    className="text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 font-semibold"
                  >
                    Details
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 dark:text-stone-400">Location</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {weatherStatus.location}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 dark:text-stone-400">Temperature & Humidity</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {weatherStatus.temperatureC}°C • {weatherStatus.humidityPercent}% RH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 dark:text-stone-400">Heat Stress Severity</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {weatherStatus.heatStressLevel}
                  </span>
                </div>

                <div className="rounded-xl bg-amber-500/15 dark:bg-amber-950/40 p-2.5 border border-amber-300/60 dark:border-amber-900/60 text-amber-950 dark:text-amber-300 text-[11px] backdrop-blur-xs">
                  {weatherStatus.silageStorageAlert}
                </div>
              </div>
            </div>
          </div>

          {/* Herd Quick Selection with Organic Leaf Background */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-900/15 dark:border-emerald-500/25 shadow-xs group">
            {/* Relatable Agricultural Leaf Background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <img
                src="/leaf_texture.jpg"
                alt="Agricultural crop leaves"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-bottom scale-105 opacity-35 dark:opacity-25 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-emerald-50/90 dark:from-stone-900/90 dark:via-stone-900/85 dark:to-emerald-950/90 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10 dark:border-emerald-500/15">
                <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                  <Sprout className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Dairy Cattle Herd ({cattleList.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('cattle')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 font-semibold"
                >
                  Manage
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {cattleList.map((cow) => (
                  <div
                    key={cow.id}
                    onClick={() => setActiveTab('ration')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/75 dark:bg-stone-800/75 border border-emerald-900/10 dark:border-emerald-500/15 hover:border-emerald-500/40 hover:bg-white/95 dark:hover:bg-stone-800/95 cursor-pointer transition-all text-xs backdrop-blur-xs shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">
                        {cow.name}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {cow.breed} • {cow.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        {cow.dailyMilkYieldLiters} L / day
                      </span>
                      <span className="text-[10px] text-stone-400">Fat: {cow.milkFatPercent}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('ration')}
                className="mt-4 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 py-2.5 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Scale className="h-3.5 w-3.5" />
                Open TMR Ration Balancer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
