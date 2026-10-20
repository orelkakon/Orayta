'use client';

import { useState, useCallback, useRef } from 'react';
import type { FeedCommentsTarget, FeedCommentTarget } from '@/types';
import { commentKey } from '@/lib/feedComments';

/**
 * Which post's comments are open, plus live count overrides. Counts arrive
 * with the feed/reels payload; once a thread is opened its authoritative
 * total replaces that snapshot, so the badge reflects what was just posted.
 */
export function useCommentsSheet() {
  const [target, setTarget] = useState<FeedCommentsTarget | null>(null);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const targetRef = useRef<FeedCommentsTarget | null>(null);

  const open = useCallback((t: FeedCommentsTarget) => { targetRef.current = t; setTarget(t); }, []);
  const close = useCallback(() => { targetRef.current = null; setTarget(null); }, []);

  const onTotal = useCallback((n: number) => {
    const t = targetRef.current;
    if (t) setTotals(prev => ({ ...prev, [commentKey(t.type, t.id)]: n }));
  }, []);

  const countFor = useCallback((type: FeedCommentTarget, id: string, base = 0) =>
    totals[commentKey(type, id)] ?? base, [totals]);

  return { target, open, close, onTotal, countFor };
}
