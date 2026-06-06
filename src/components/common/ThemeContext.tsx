'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'orayta_theme';

interface DarkCtxValue { isDark: boolean; toggle: () => void; }
const DarkCtx = createContext<DarkCtxValue>({ isDark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark = localStorage.getItem(KEY) === 'dark';
    setIsDark(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem(KEY, next ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return <DarkCtx.Provider value={{ isDark, toggle }}>{children}</DarkCtx.Provider>;
}

export const useDarkMode = () => useContext(DarkCtx);
