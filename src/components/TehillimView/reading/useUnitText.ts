'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Segment } from '@/lib/tehillim/units';

/**
 * The verses of a unit: each chapter fetched once per page (cached in
 * memory, the next unit's first chapter prefetched by the caller), sliced to
 * the unit's verse range for 119's letters and the day portions.
 */
export interface ChapterText { chapter: number; first: number; verses: string[] }

const memo = new Map<number, Promise<string[]>>();

export function fetchChapter(n: number): Promise<string[]> {
  const hit = memo.get(n);
  if (hit) return hit;
  const p = fetch(`/api/tehillim/text/${n}`)
    .then(r => (r.ok ? r.json() as Promise<{ verses: string[] }> : Promise.reject(new Error(String(r.status)))))
    .then(b => b.verses);
  p.catch(() => memo.delete(n));
  memo.set(n, p);
  return p;
}

export function useUnitText(segments: Segment[] | null) {
  const [chapters, setChapters] = useState<ChapterText[] | null>(null);
  const [failed, setFailed] = useState(false);
  const key = segments ? JSON.stringify(segments) : '';

  const loadAll = useCallback(() => {
    if (!segments) return () => undefined;
    let live = true;
    setChapters(null);
    setFailed(false);
    Promise.all(segments.map(async s => {
      const all = await fetchChapter(s.chapter);
      const first = s.from ?? 1;
      return { chapter: s.chapter, first, verses: all.slice(first - 1, s.to ?? all.length) };
    })).then(c => { if (live) setChapters(c); }, () => { if (live) setFailed(true); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => loadAll(), [loadAll]);
  return { chapters, failed, retry: loadAll };
}
