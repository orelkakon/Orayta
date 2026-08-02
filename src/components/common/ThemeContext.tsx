'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'orayta_theme';

interface DarkCtxValue { isDark: boolean; toggle: () => void; }
const DarkCtx = createContext<DarkCtxValue>({ isDark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Light is the product default for everyone; dark only when the user
    // explicitly chose it with the toggle (OS preference is ignored).
    const dark = localStorage.getItem(KEY) === 'dark';
    setIsDark(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem(KEY, next ? 'dark' : 'light'); } catch {}
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const value = useMemo(() => ({ isDark, toggle }), [isDark, toggle]);

  return <DarkCtx.Provider value={value}>{children}</DarkCtx.Provider>;
}

export const useDarkMode = () => useContext(DarkCtx);
