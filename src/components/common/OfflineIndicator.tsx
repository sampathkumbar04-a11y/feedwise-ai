import React, { useState } from 'react';
import { WifiOff, Database, CheckCircle2, X, HardDriveDownload } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  onToggleSimulate?: () => void;
  isSimulated?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  onToggleSimulate,
  isSimulated,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-stone-900/95 p-4 text-white shadow-2xl backdrop-blur-md dark:bg-stone-900/95 dark:border-amber-500/30">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          <WifiOff className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-amber-300 tracking-wide uppercase">
              Offline Field Mode Active
            </h4>
            {isSimulated && (
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                Demo Test
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-stone-300 leading-relaxed">
            Feed spectrometry, Flieg score fermentation, and TMR dairy rations are running locally. All new feed scans and herd logs are saved to your device.
          </p>

          <div className="mt-2.5 flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Database className="h-3 w-3" /> Local Storage Active
            </span>
            {onToggleSimulate && (
              <button
                type="button"
                onClick={onToggleSimulate}
                className="underline text-amber-300 hover:text-amber-200 font-medium"
              >
                Restore Online Sync
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-stone-400 hover:text-white p-1 rounded-md"
          title="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
