'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ParashaText, ParashaWeek } from '@/types/dailyLearning';
import type { ParashaPart } from '@/lib/parasha/refs';
import { israelDateKey } from '@/lib/dailyLearning/kinds';

export type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'ready'; data: T };

/** Fetches JSON for a URL (null = nothing to load), with a retry. */
function useJson<T>(url: string | null): { load: Load<T>; retry: () => void } {
  const [load, setLoad] = useState<Load<T>>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    setLoad({ state: 'loading' });
    fetch(url)
      .then(r => (r.ok ? r.json() as Promise<T> : Promise.reject(new Error(String(r.status)))))
      .then(data => { if (alive) setLoad({ state: 'ready', data }); })
      .catch(() => { if (alive) setLoad({ state: 'error' }); });
    return () => { alive = false; };
  }, [url, attempt]);
  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { load, retry };
}

/** The Israel date, fixed for the page's life (always sent: Sefaria's own clock isn't Israel's). */
function useIsraelDate(): string | null {
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => setDate(israelDateKey(new Date())), []);
  return date;
}

export function useParashaWeek() {
  const date = useIsraelDate();
  return { date, ...useJson<ParashaWeek>(date ? `/api/parasha?date=${date}` : null) };
}

export function useParashaText(date: string | null, part: ParashaPart | null) {
  return useJson<ParashaText>(date && part !== null ? `/api/parasha/text?date=${date}&part=${part}` : null);
}
