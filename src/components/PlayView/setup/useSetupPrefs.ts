'use client';

import { useEffect, useState } from 'react';
import type { PlaySettings } from '@/types/play';
import { DEFAULT_KINDS, isKind, LEVELS } from '@/lib/play/kinds';
import { QUESTION_COUNTS, QUESTION_SECONDS } from '@/lib/play/rules';

/** The host's last setup, remembered per device (a rabbi reuses the same mix). */
const KEY = 'orayta_play_setup';

export type SetupPrefs = Required<Pick<PlaySettings, 'kinds' | 'count' | 'seconds' | 'level' | 'eras'>> & { scope: string };

export const DEFAULT_PREFS: SetupPrefs = { kinds: DEFAULT_KINDS, count: 10, seconds: 20, level: 'normal', eras: [], scope: '' };

function load(): SetupPrefs {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<SetupPrefs> | null;
    if (!raw) return DEFAULT_PREFS;
    const kinds = Array.isArray(raw.kinds) ? raw.kinds.filter(isKind) : [];
    return {
      kinds: kinds.length ? kinds : DEFAULT_KINDS,
      count: (QUESTION_COUNTS as readonly number[]).includes(raw.count ?? 0) ? raw.count! : DEFAULT_PREFS.count,
      seconds: (QUESTION_SECONDS as readonly number[]).includes(raw.seconds ?? 0) ? raw.seconds! : DEFAULT_PREFS.seconds,
      level: LEVELS.find(l => l === raw.level) ?? 'normal',
      eras: Array.isArray(raw.eras) ? raw.eras.filter((e): e is string => typeof e === 'string') : [],
      scope: typeof raw.scope === 'string' ? raw.scope : '',
    };
  } catch { return DEFAULT_PREFS; }
}

export function useSetupPrefs(): [SetupPrefs, (patch: Partial<SetupPrefs>) => void] {
  const [prefs, setPrefs] = useState<SetupPrefs>(DEFAULT_PREFS);
  useEffect(() => { setPrefs(load()); }, []);
  const update = (patch: Partial<SetupPrefs>) => setPrefs(cur => {
    const next = { ...cur, ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode — fine */ }
    return next;
  });
  return [prefs, update];
}
