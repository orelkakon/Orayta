import { useEffect } from 'react';

/**
 * Freezes the page behind an overlay. `overflow: hidden` alone doesn't stop
 * iOS (Safari and the home-screen app) from scrolling the body, so the body is
 * pinned with `position: fixed` at the current offset and restored on release.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const y = window.scrollY;
    const s = document.body.style;
    const prev = { position: s.position, top: s.top, left: s.left, right: s.right, overflow: s.overflow };
    s.position = 'fixed';
    s.top = `-${y}px`;
    s.left = '0';
    s.right = '0';
    s.overflow = 'hidden';
    return () => {
      Object.assign(s, prev);
      window.scrollTo(0, y);
    };
  }, [active]);
}
