'use client';

import { useCallback, useEffect, useState } from 'react';
import { omerStatus, OmerStatus, omerStreak, omerGap } from '@/lib/omer';

const KEY = 'orayta_omer';
type OmerLog = Record<string, number[]>;

const yearFmt = (() => {
  try { return new Intl.DateTimeFormat('en-u-ca-hebrew', { timeZone: 'Asia/Jerusalem', year: 'numeric' }); }
  catch { return null; }
})();

/** Hebrew year of a counting season (Nisan–Sivan never straddle Rosh Hashana). */
const seasonKey = (d: Date) => yearFmt?.formatToParts(d).find(p => p.type === 'year')?.value ?? String(d.getFullYear());

function read(): OmerLog {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out: OmerLog = {};
    Object.entries(raw as Record<string, unknown>).forEach(([y, v]) => {
      if (Array.isArray(v)) out[y] = v.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= 49);
    });
    return out;
  } catch {
    return {};
  }
}

/** Omer status for "now" (Jerusalem), refreshed every minute and on tab return. */
export function useOmerNow(): { status: OmerStatus; now: Date } | null {
  const [state, setState] = useState<{ status: OmerStatus; now: Date } | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = omerStatus(now);
      setState(prev => (prev && prev.status.isNight === next.isNight && prev.status.tonight === next.tonight
        && prev.status.today === next.today ? prev : { status: next, now }));
    };
    tick();
    const t = window.setInterval(tick, 60000);
    const onVis = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return state;
}

/** "ספרתי" marks for this season, per device. `current` = the count the user is on now. */
export function useOmerLog(current: number | null) {
  const [counted, setCounted] = useState<number[]>([]);
  const [year, setYear] = useState('');

  useEffect(() => {
    const y = seasonKey(new Date());
    setYear(y);
    setCounted(read()[y] ?? []);
  }, []);

  const toggle = useCallback((day: number) => {
    setCounted(prev => {
      const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b);
      try { localStorage.setItem(KEY, JSON.stringify({ ...read(), [year]: next })); } catch {}
      return next;
    });
  }, [year]);

  return {
    counted,
    toggle,
    streak: current ? omerStreak(counted, current) : 0,
    gap: current ? omerGap(counted, current) : null,
  };
}
