import React, { useState } from 'react';
import { Wifi, WifiOff, HardDrive, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Modal } from './Modal';

interface OfflineStatusBadgeProps {
  isOnline: boolean;
  onToggleSimulate?: () => void;
  isSimulated?: boolean;
}

export const OfflineStatusBadge: React.FC<OfflineStatusBadgeProps> = ({
  isOnline,
  onToggleSimulate,
  isSimulated = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 animate-pulse'
        }`}
        title="View Network & Offline Cache Status"
      >
        {isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline font-bold">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-bold">Offline Mode</span>
          </>
        )}
      </button>

      {/* Offline Diagnostics & Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Network & Offline Capabilities"
        subtitle="Designed for reliable barn, field, and rural dairy operations without cellular data"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div
            className={`rounded-xl p-3.5 border flex items-start gap-3 ${
              isOnline
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-200'
                : 'bg-amber-50/60 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-200'
            }`}
          >
            <div className="p-2 rounded-lg bg-white/80 dark:bg-stone-900/80 shadow-xs">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Current Status: {isOnline ? 'Connected (Online)' : 'Field Disconnected (Offline)'}
                </span>
                {isSimulated && (
                  <span className="rounded bg-amber-200 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Simulated
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs opacity-90 leading-relaxed">
                {isOnline
                  ? 'All local calculations are backed up to device storage and cloud synchronization is active.'
                  : 'FeedWise AI is running fully in offline mode. Feed scans, silage Flieg fermentation ratings, and herd records continue to work and save locally.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Offline Ready Modules
            </h5>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Feed Spectrometry & Flieg Score
                  </span>
                </div>
                <span className="text-[10px] font-mono rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  100% Client-side
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Dairy TMR Ration Optimizer
                  </span>
                </div>
                <span className="text-[10px] font-mono rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  ICAR / NRC Local Math
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Livestock & Milk Records
                  </span>
                </div>
                <span className="text-[10px] font-mono rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  Persistent Storage
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-stone-50 p-2.5 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Agronomy & Silage Expert Guide
                  </span>
                </div>
                <span className="text-[10px] font-mono rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  Pre-cached Knowledge
                </span>
              </div>
            </div>
          </div>

          {/* Test Offline Mode button */}
          {onToggleSimulate && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                  Simulate Field Conditions
                </span>
                <span className="text-[11px] text-stone-500">
                  Toggle to test app performance without network
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onToggleSimulate();
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  isSimulated
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900'
                }`}
              >
                {isSimulated ? 'Exit Simulation (Go Online)' : 'Simulate Offline'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
