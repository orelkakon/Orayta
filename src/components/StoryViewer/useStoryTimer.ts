'use client';

import { useEffect, useRef, RefObject } from 'react';
import { STORY_DURATION_MS } from '@/lib/stories';

/**
 * rAF-driven auto-advance timer. Progress is written straight to the active
 * bar's transform (no re-render per frame) and onDone fires when it fills.
 * Deliberately JS-driven rather than a CSS animation: the global
 * reduced-motion clamp zeroes CSS animation durations, which would make a
 * CSS-timed story skip instantly. With `enabled: false` (reduced motion)
 * there is no auto-advance at all — the user taps through at their own pace.
 */
export function useStoryTimer(
  index: number,
  paused: boolean,
  enabled: boolean,
  onDone: () => void,
  durationMs: number = STORY_DURATION_MS,
): RefObject<HTMLDivElement> {
  const barRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    elapsedRef.current = 0;
    if (barRef.current) barRef.current.style.transform = 'scaleX(0)';
  }, [index]);

  useEffect(() => {
    if (!enabled || paused) return;
    let raf = 0;
    let last = performance.now();
    let finished = false;
    const tick = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      const p = Math.min(1, elapsedRef.current / durationMs);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (p >= 1) {
        if (!finished) { finished = true; doneRef.current(); }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, paused, enabled, durationMs]);

  return barRef;
}
