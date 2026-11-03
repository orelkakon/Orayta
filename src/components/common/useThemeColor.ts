import { useEffect } from 'react';
import { syncThemeColor } from './ThemeContext';

/**
 * Immersive screens (feed, stories, players) tint the browser / status bar to
 * their own background while mounted, then hand it back to the app chrome.
 */
export function useThemeColor(color: string, active = true): void {
  useEffect(() => {
    if (!active) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    meta.dataset.locked = '1';
    meta.content = color;
    return () => {
      delete meta.dataset.locked;
      syncThemeColor();
    };
  }, [color, active]);
}
