import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearFeedwiseStorage } from '../../utils/storage';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FeedWise ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetStorage = () => {
    clearFeedwiseStorage();
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isQuota =
        this.state.error?.name === 'QuotaExceededError' ||
        this.state.error?.message?.toLowerCase().includes('quota') ||
        this.state.error?.message?.toLowerCase().includes('storage');

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-2">
              {isQuota ? 'Storage Limit Reached' : 'Something went wrong'}
            </h1>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              {isQuota
                ? 'Your browser storage quota for scanned feed images was reached. You can clear the local feed scans cache to resume normal operation without losing your app settings.'
                : 'An unexpected application state occurred. You can reload the page or clear the local feed storage cache.'}
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-lg bg-stone-100 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-left overflow-x-auto text-[11px] font-mono text-amber-800 dark:text-amber-300 max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2.5 transition-colors shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cache & Restart</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium text-xs px-4 py-2.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
