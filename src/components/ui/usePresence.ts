import { useEffect, useState } from 'react';

/**
 * Keeps an overlay mounted through its exit transition.
 * `mounted` — render it at all; `shown` — apply the visible state. Opening
 * mounts first and flips `shown` on the next frame so the CSS transition runs
 * from the hidden state; closing flips `shown` off and unmounts after `exitMs`.
 */
export function usePresence(open: boolean, exitMs: number): { mounted: boolean; shown: boolean } {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames: the first commits the hidden styles, the second animates.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);

  return { mounted, shown };
}
