'use client';

import { useCallback, useEffect, useState } from 'react';
import { SikumSortKey } from '@/lib/sikum/order';

export type SikumViewMode = 'list' | 'grid';
/** The active sort, each sort's own direction (true = reversed), and the layout. */
export interface SikumOrderPref { by: SikumSortKey; rev: Record<SikumSortKey, boolean>; view: SikumViewMode }

const DEFAULT: SikumOrderPref = { by: 'date', rev: { date: false, order: false }, view: 'list' };
const KEY = 'orayta_sikum_order';
/** Set once the reader has flipped a direction — the "tap again" hint then goes away. */
const FLIP_SEEN_KEY = 'orayta_sikum_flip_seen';

interface Saved { by?: unknown; rev?: Partial<Record<SikumSortKey, unknown>>; view?: unknown; sort?: unknown }

/** Reads a saved pref, including the older { sort: 'desc' | 'asc' | 'order' } shape. */
function parse(saved: Saved | undefined): SikumOrderPref {
  if (!saved) return DEFAULT;
  const view: SikumViewMode = saved.view === 'grid' ? 'grid' : 'list';
  if (saved.by === 'date' || saved.by === 'order') {
    return { by: saved.by, rev: { date: saved.rev?.date === true, order: saved.rev?.order === true }, view };
  }
  if (saved.sort === 'order') return { ...DEFAULT, by: 'order', view };
  return { ...DEFAULT, rev: { date: saved.sort === 'asc', order: false }, view };
}

function readAll(): Record<string, Saved> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Saved>; } catch { return {}; }
}

/** The order + layout chosen for a book, remembered per book on this device. */
export function useSikumOrderPref(bookId: string) {
  const [pref, setPref] = useState<SikumOrderPref>(DEFAULT);
  const [flipSeen, setFlipSeen] = useState(true);
  useEffect(() => {
    setPref(parse(readAll()[bookId]));
    try { setFlipSeen(localStorage.getItem(FLIP_SEEN_KEY) === '1'); } catch { setFlipSeen(true); }
  }, [bookId]);

  const commit = useCallback((next: SikumOrderPref) => {
    setPref(next);
    try { localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [bookId]: next })); } catch {}
  }, [bookId]);

  /** Tapping the active sort flips its direction; tapping the other one switches to it. */
  const pickSort = useCallback((by: SikumSortKey) => {
    if (pref.by !== by) { commit({ ...pref, by }); return; }
    commit({ ...pref, rev: { ...pref.rev, [by]: !pref.rev[by] } });
    setFlipSeen(true);
    try { localStorage.setItem(FLIP_SEEN_KEY, '1'); } catch {}
  }, [pref, commit]);

  const setView = useCallback((view: SikumViewMode) => commit({ ...pref, view }), [pref, commit]);

  return { pref, flipSeen, pickSort, setView };
}
