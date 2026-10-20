'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LearnKind } from '@/types/dailyLearning';
import { israelDateKey } from '@/lib/dailyLearning/kinds';
import { LearnLog, LEARN_LOG_KEY, learnStreak, readLearnLog, toggleDate, writeLearnLog } from '@/lib/dailyLearning/log';

/** Per-device "learned today" marks with day streaks, synced across tabs. */
export function useLearnLog() {
  const [log, setLog] = useState<LearnLog>({});
  const [today, setToday] = useState('');

  useEffect(() => {
    setLog(readLearnLog());
    setToday(israelDateKey(new Date()));
    const onStorage = (e: StorageEvent) => { if (e.key === LEARN_LOG_KEY) setLog(readLearnLog()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((kind: LearnKind) => {
    const date = israelDateKey(new Date());
    setLog(prev => {
      const next = { ...prev, [kind]: toggleDate(prev[kind] ?? [], date) };
      writeLearnLog(next);
      return next;
    });
  }, []);

  return {
    isDone: (kind: LearnKind) => Boolean(today) && (log[kind] ?? []).includes(today),
    streak: (kind: LearnKind) => (today ? learnStreak(log[kind] ?? [], today) : 0),
    toggle,
  };
}
