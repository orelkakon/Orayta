'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LearnKind, LearnText, LearnToday } from '@/types/dailyLearning';
import { israelDateKey } from '@/lib/dailyLearning/kinds';

export type Load<T> = { state: 'loading' } | { state: 'error'; notToday?: boolean } | { state: 'ready'; data: T };

// One request per date for the whole session (the /today card and the reader share it).
const todayCache = new Map<string, Promise<LearnToday>>();

function loadToday(date: string): Promise<LearnToday> {
  let p = todayCache.get(date);
  if (!p) {
    p = fetch(`/api/learn?date=${date}`).then(r => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<LearnToday>;
    });
    p.catch(() => todayCache.delete(date));
    todayCache.set(date, p);
  }
  return p;
}

/** Today's portions (Israel date). `retry` re-fetches after a failure. */
export function useLearnToday(): { load: Load<LearnToday>; retry: () => void } {
  const [load, setLoad] = useState<Load<LearnToday>>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoad({ state: 'loading' });
    loadToday(israelDateKey(new Date()))
      .then(data => { if (alive) setLoad({ state: 'ready', data }); })
      .catch(() => { if (alive) setLoad({ state: 'error' }); });
    return () => { alive = false; };
  }, [attempt]);
  return { load, retry: useCallback(() => setAttempt(a => a + 1), []) };
}

/** The text of today's portion of one cycle; `explain` adds Steinsaltz (Talmud). */
export function useLearnText(kind: LearnKind, explain: boolean): { load: Load<LearnText>; retry: () => void } {
  const [load, setLoad] = useState<Load<LearnText>>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoad(prev => (prev.state === 'ready' && prev.data.kind === kind ? prev : { state: 'loading' }));
    const qs = `date=${israelDateKey(new Date())}${explain ? '&explain=1' : ''}`;
    fetch(`/api/learn/${kind}?${qs}`)
      .then(async r => {
        if (r.status === 404) { if (alive) setLoad({ state: 'error', notToday: true }); return; }
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json() as LearnText;
        if (alive) setLoad({ state: 'ready', data });
      })
      .catch(() => { if (alive) setLoad({ state: 'error' }); });
    return () => { alive = false; };
  }, [kind, explain, attempt]);
  return { load, retry: useCallback(() => setAttempt(a => a + 1), []) };
}
