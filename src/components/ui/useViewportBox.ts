import { RefObject, useEffect } from 'react';

const KEYBOARD_PX = 140;

/**
 * Keeps a full-height sheet inside the visible part of the screen. iOS doesn't
 * shrink the layout viewport for the software keyboard, so a fixed panel ends
 * up behind it (and its footer buttons with it). The visual viewport's box is
 * written to the panel as `--vv-top` / `--vv-h`, plus `--sheet-safe-b: 0px`
 * while the keyboard covers the home indicator. Skipped while pinch-zoomed.
 */
export function useViewportBox(enabled: boolean, panel: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = panel.current;
    const vv = window.visualViewport;
    if (!enabled || !el || !vv) return;
    const clear = () => ['--vv-top', '--vv-h', '--sheet-safe-b'].forEach(k => el.style.removeProperty(k));
    const sync = () => {
      if (Math.abs(vv.scale - 1) > 0.01) { clear(); return; }
      el.style.setProperty('--vv-top', `${vv.offsetTop}px`);
      el.style.setProperty('--vv-h', `${vv.height}px`);
      if (window.innerHeight - vv.height > KEYBOARD_PX) el.style.setProperty('--sheet-safe-b', '0px');
      else el.style.removeProperty('--sheet-safe-b');
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      clear();
    };
  }, [enabled, panel]);
}
