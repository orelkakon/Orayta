'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { THEME_KEY as KEY, DARK_MQ } from '@/lib/themeBoot';

export type ThemeMode = 'light' | 'dark' | 'system';

/* Light stays the product default; "dark" and "system" (follow the device)
   are explicit choices made in the "עוד" sheet or with the header toggle. */
const DEFAULT_MODE: ThemeMode = 'light';

interface ThemeCtxValue {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({
  mode: DEFAULT_MODE, isDark: false, setMode: () => {}, toggle: () => {},
});

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {}
  return DEFAULT_MODE;
}

/** Keep the browser/status-bar colour on the header's chrome colour. */
export function syncThemeColor(): void {
  const chrome = getComputedStyle(document.documentElement).getPropertyValue('--color-chrome').trim();
  if (!chrome) return;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  if (!meta.dataset.locked) meta.content = chrome;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setModeState(readMode());
    const mq = window.matchMedia(DARK_MQ);
    const sync = () => setSystemDark(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    syncThemeColor();
  }, [isDark]);

  const setMode = useCallback((next: ThemeMode) => {
    try { localStorage.setItem(KEY, next); } catch {}
    setModeState(next);
  }, []);

  const toggle = useCallback(() => setMode(isDark ? 'light' : 'dark'), [isDark, setMode]);

  const value = useMemo(() => ({ mode, isDark, setMode, toggle }), [mode, isDark, setMode, toggle]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useDarkMode = () => useContext(ThemeCtx);
