import React, { useState } from 'react';
import { Download, Smartphone, Check, X, Share } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as standalone PWA, hide install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    await install();
    setIsInstalling(false);
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
            : "inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition-all"
        }
        title="Install FeedWise AI as standalone offline app"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors"
          title="Add FeedWise AI to your iPhone / iPad home screen"
        >
          <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    Install on iPhone / iPad
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-stone-600 dark:text-stone-300">
                <p className="font-medium text-stone-800 dark:text-stone-200">
                  Install FeedWise AI for full offline bunker silage & ration calculations directly on your farm:
                </p>
                <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 space-y-2 border border-stone-200/60 dark:border-stone-700/60">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      1
                    </span>
                    <p className="flex-1">
                      Tap the <strong className="inline-flex items-center gap-1 font-semibold text-stone-900 dark:text-white"><Share className="h-3 w-3" /> Share</strong> icon at the bottom of Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      2
                    </span>
                    <p className="flex-1">
                      Scroll down and select <strong className="text-stone-900 dark:text-white">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      3
                    </span>
                    <p className="flex-1">
                      Tap <strong className="text-stone-900 dark:text-white">"Add"</strong> in the top-right corner.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
