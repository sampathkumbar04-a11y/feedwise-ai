/**
 * Robust LocalStorage and Image Compression Utility for FeedWise AI
 * Prevents QuotaExceededError and gracefully handles browser storage limits.
 */

import { FeedScanReport } from '../types';

/**
 * Compresses an image data URL or image file down to a lightweight web-friendly JPEG.
 * Scales down to maxWidth/maxHeight (default: 640x480) with 0.65 JPEG compression.
 * Reduces 5MB-15MB captures down to ~25KB-50KB.
 */
export async function compressImage(
  source: string | File,
  maxWidth = 640,
  maxHeight = 480,
  quality = 0.65
): Promise<string> {
  // If it's an external HTTP URL (e.g. Unsplash preset), no compression needed
  if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('/'))) {
    return source;
  }

  return new Promise((resolve) => {
    let dataUri = '';
    const proceedWithDataUri = (uri: string) => {
      // If already a tiny string (< 30KB), return as is
      if (uri.length < 35000) {
        resolve(uri);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Calculate scaled aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(uri);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          console.warn('Canvas compression error, using fallback:', e);
          resolve(uri);
        }
      };

      img.onerror = () => {
        resolve(uri);
      };

      img.src = uri;
    };

    if (typeof source === 'string') {
      proceedWithDataUri(source);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        dataUri = (e.target?.result as string) || '';
        proceedWithDataUri(dataUri);
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(source);
    }
  });
}

/**
 * In-memory fallback map in case localStorage is disabled or strictly quota-exhausted.
 */
const memoryStorage = new Map<string, string>();

/**
 * Safely retrieve an item from localStorage with error catching and JSON parsing.
 */
export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const mem = memoryStorage.get(key);
      return mem ? JSON.parse(mem) : fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`safeGetItem failed for key "${key}":`, err);
    const mem = memoryStorage.get(key);
    return mem ? (JSON.parse(mem) as T) : fallback;
  }
}

/**
 * Creates a lightweight sanitized version of scan reports for persistent storage.
 * Ensures giant base64 data URLs don't blow the 5MB browser quota.
 */
export function sanitizeScanReportsForStorage(reports: FeedScanReport[]): FeedScanReport[] {
  // Cap at the most recent 25 scan reports
  const sliced = reports.slice(0, 25);

  return sliced.map((report) => {
    // If imageUrl is a huge data URL (> 45,000 characters), truncate or store placeholder
    let safeImageUrl = report.imageUrl;
    if (safeImageUrl && safeImageUrl.startsWith('data:image') && safeImageUrl.length > 45000) {
      // It's still oversized; substitute with a lightweight placeholder indicator
      safeImageUrl = '';
    }

    return {
      ...report,
      imageUrl: safeImageUrl,
    };
  });
}

/**
 * Safely store an item in localStorage with automatic QuotaExceededError mitigation:
 * 1. If quota exceeded, attempts to prune non-essential keys
 * 2. If 'feedwise_scans', sanitizes and trims reports
 * 3. Falls back to in-memory storage so the app NEVER crashes
 */
export function safeSetItem(key: string, value: any): boolean {
  try {
    const serialized = JSON.stringify(value);
    memoryStorage.set(key, serialized);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error: any) {
    console.warn(`localStorage.setItem failed for key "${key}". Attempting quota recovery...`, error);

    const isQuotaError =
      error?.name === 'QuotaExceededError' ||
      error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22 ||
      error?.code === 1014 ||
      (typeof error?.message === 'string' && error.message.toLowerCase().includes('quota'));

    if (isQuotaError) {
      try {
        // Recovery 1: Prune transient weather cache
        localStorage.removeItem('feedwise_weather_cache');

        // Recovery 2: If we are setting scan reports, strip heavy image payloads
        if (key === 'feedwise_scans' && Array.isArray(value)) {
          const sanitized = sanitizeScanReportsForStorage(value as FeedScanReport[]);
          const sanitizedString = JSON.stringify(sanitized);
          localStorage.setItem(key, sanitizedString);
          return true;
        }

        // Recovery 3: If another key failed, sanitize existing scan reports in localStorage
        const rawScans = localStorage.getItem('feedwise_scans');
        if (rawScans) {
          try {
            const parsed = JSON.parse(rawScans);
            if (Array.isArray(parsed)) {
              const cleaned = sanitizeScanReportsForStorage(parsed as FeedScanReport[]);
              localStorage.setItem('feedwise_scans', JSON.stringify(cleaned));
            }
          } catch {
            localStorage.removeItem('feedwise_scans');
          }
        }

        // Retry saving original request
        const retrySerialized = JSON.stringify(value);
        localStorage.setItem(key, retrySerialized);
        return true;
      } catch (recoveryErr) {
        console.error('Storage quota recovery could not save to localStorage. Fallback to in-memory storage.', recoveryErr);
        // Stored in memoryStorage above, so app will continue seamlessly
        return false;
      }
    }

    return false;
  }
}

/**
 * Utility to wipe FeedWise cache and recover storage when completely exhausted.
 */
export function clearFeedwiseStorage(): void {
  try {
    localStorage.removeItem('feedwise_scans');
    localStorage.removeItem('feedwise_safety_assessments');
    localStorage.removeItem('feedwise_weather_cache');
    localStorage.removeItem('feedwise_costs');
    memoryStorage.clear();
  } catch (e) {
    console.warn('Error clearing storage:', e);
  }
}
