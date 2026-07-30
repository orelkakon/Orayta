'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { FeedItem, FeedReaction } from '@/types';

const REACTED_PREFIX = 'orayta_feed_reacted_';
const SAVED_PREFIX   = 'orayta_feed_saved_';

function loadSavedItems(): FeedItem[] {
  try {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(SAVED_PREFIX))
      .flatMap(k => { try { return [JSON.parse(localStorage.getItem(k)!) as FeedItem]; } catch { return []; } });
  } catch { return []; }
}

// Device-local engagement state (reactions + bookmarks) and its handlers,
// kept out of FeedView so the view stays focused on feed composition.
export function useFeedEngagement(setCards: Dispatch<SetStateAction<FeedItem[]>>) {
  const [reacted, setReacted]       = useState<Record<string, Partial<Record<FeedReaction, true>>>>({});
  const [savedIds, setSavedIds]     = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Migrate old liked keys to new reaction keys
    try {
      Object.keys(localStorage).filter(k => k.startsWith('orayta_feed_liked_')).forEach(k => {
        const nk = k.replace('orayta_feed_liked_', `${REACTED_PREFIX}heart_`);
        localStorage.setItem(nk, '1');
        localStorage.removeItem(k);
      });
    } catch {}

    // Load reactions
    try {
      const initial: Record<string, Partial<Record<FeedReaction, true>>> = {};
      Object.keys(localStorage).filter(k => k.startsWith(REACTED_PREFIX)).forEach(k => {
        const rest = k.slice(REACTED_PREFIX.length);
        const [reaction, ...itemParts] = rest.split('_');
        const itemKey = itemParts.join('_');
        if (!initial[itemKey]) initial[itemKey] = {};
        initial[itemKey][reaction as FeedReaction] = true;
      });
      setReacted(initial);
    } catch {}

    // Load saved
    const saved = loadSavedItems();
    setSavedItems(saved);
    setSavedIds(new Set(saved.map(i => `${i.type}:${i.id}`)));
  }, []);

  const handleReact = useCallback(async (item: FeedItem, reaction: FeedReaction) => {
    const key = `${item.type}:${item.id}`;
    const isOn = Boolean(reacted[key]?.[reaction]);
    if (isOn) {
      // un-react: remove locally only
      try { localStorage.removeItem(`${REACTED_PREFIX}${reaction}_${key}`); } catch {}
      setReacted(prev => {
        const copy = { ...prev[key] };
        delete copy[reaction];
        return { ...prev, [key]: copy };
      });
      setCards(prev => prev.map(c => c.type === item.type && c.id === item.id
        ? { ...c, reactions: { ...c.reactions, [reaction]: Math.max(0, c.reactions[reaction] - 1) } }
        : c
      ));
    } else {
      try { localStorage.setItem(`${REACTED_PREFIX}${reaction}_${key}`, '1'); } catch {}
      setReacted(prev => ({ ...prev, [key]: { ...prev[key], [reaction]: true } }));
      setCards(prev => prev.map(c => c.type === item.type && c.id === item.id
        ? { ...c, reactions: { ...c.reactions, [reaction]: c.reactions[reaction] + 1 } }
        : c
      ));
      try {
        await fetch('/api/feed/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: item.type, id: item.id, reaction }) });
      } catch {}
    }
  }, [reacted, setCards]);

  const handleBookmark = useCallback((item: FeedItem) => {
    const key = `${item.type}:${item.id}`;
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        try { localStorage.removeItem(`${SAVED_PREFIX}${key}`); } catch {}
        setSavedItems(prev2 => prev2.filter(i => `${i.type}:${i.id}` !== key));
      } else {
        next.add(key);
        try { localStorage.setItem(`${SAVED_PREFIX}${key}`, JSON.stringify(item)); } catch {}
        setSavedItems(prev2 => [...prev2, item]);
        void fetch('/api/feed/save', { method: 'POST' }).catch(() => {});
      }
      return next;
    });
  }, []);

  return { reacted, savedIds, savedItems, handleReact, handleBookmark };
}
