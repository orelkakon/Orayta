'use client';

import { useEffect } from 'react';

interface WakeLockSentinelLike { release: () => Promise<void> }
interface WakeLockLike { request: (type: 'screen') => Promise<WakeLockSentinelLike> }

/**
 * Keeps the screen on while `active` (praying from the phone shouldn't dim
 * mid-Amidah). The lock drops whenever the tab hides, so it is re-requested
 * on return. Silently a no-op where the Screen Wake Lock API is missing.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    const wl = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
    if (!active || !wl) return;
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        const s = await wl.request('screen');
        if (cancelled) { void s.release(); return; }
        sentinel = s;
      } catch { /* denied / low battery — keep reading without it */ }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') void acquire(); };
    void acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
