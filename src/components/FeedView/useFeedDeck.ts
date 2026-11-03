import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';
import type { FeedItem } from '@/types';
import { ALL_FEED_TYPES, FeedPrefs } from '@/lib/feedPrefs';
import { loadFeedDeck, saveFeedDeck, freshFeedDeck } from '@/lib/feedDeck';
import { takeFeedStart } from '@/lib/feedExcerpt';

/**
 * The feed's content pages. Persistent deck: seed + page let the server deal
 * content without repeats until the pool is exhausted (see /api/feed and
 * lib/feedShuffle); it is restored on mount so revisits continue the same
 * deck instead of reshuffling. `gen` discards an in-flight page after the
 * content mix changes.
 */
export interface FeedDeck {
  cards: FeedItem[];
  setCards: Dispatch<SetStateAction<FeedItem[]>>;
  fetching: boolean;
  initialLoaded: boolean;
  loadError: boolean;
  fetchMore: () => Promise<void>;
  /** First load: continue the saved deck (and an item handed over from home). */
  start: (prefs: FeedPrefs) => void;
  /** New content mix: fresh deck from the top. */
  restart: (prefs: FeedPrefs) => void;
  retry: () => void;
}

export function useFeedDeck(): FeedDeck {
  const [cards, setCards] = useState<FeedItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [initialLoaded, setInitial] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const fetchingRef = useRef(false);
  const prefsRef = useRef<FeedPrefs | null>(null);
  const genRef = useRef(0);
  const seedRef = useRef(Math.floor(Math.random() * 4294967296));
  const pageRef = useRef(0);

  const fetchMore = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setFetching(true);
    const gen = genRef.current;
    try {
      const types = prefsRef.current?.types ?? ALL_FEED_TYPES;
      const typesQ = types.length < ALL_FEED_TYPES.length ? `&types=${types.join(',')}` : '';
      const res = await fetch(`/api/feed?seed=${seedRef.current}&page=${pageRef.current}${typesQ}`);
      if (!res.ok) throw new Error(String(res.status));
      const items: FeedItem[] = await res.json();
      if (gen !== genRef.current) return;
      setLoadError(false);
      pageRef.current += 1;
      saveFeedDeck({ seed: seedRef.current, page: pageRef.current });
      // De-dupe: the item opened from home may come round again in the deck.
      setCards(prev => {
        const have = new Set(prev.map(c => `${c.type}:${c.id}`));
        return [...prev, ...items.filter(i => !have.has(`${i.type}:${i.id}`))];
      });
    } catch {
      // Only shown while nothing is on screen — a failed next page simply
      // retries when the user scrolls on.
      if (gen === genRef.current) setLoadError(true);
    } finally {
      fetchingRef.current = false;
      setFetching(false);
      setInitial(true);
    }
  }, []);

  const start = useCallback((prefs: FeedPrefs) => {
    prefsRef.current = prefs;
    const deck = loadFeedDeck();
    seedRef.current = deck.seed;
    pageRef.current = deck.page;
    const handed = takeFeedStart();
    if (handed) setCards([handed]);
    void fetchMore();
  }, [fetchMore]);

  const restart = useCallback((prefs: FeedPrefs) => {
    prefsRef.current = prefs;
    genRef.current += 1;
    fetchingRef.current = false;
    const deck = freshFeedDeck();
    saveFeedDeck(deck);
    seedRef.current = deck.seed;
    pageRef.current = deck.page;
    setCards([]);
    void fetchMore();
  }, [fetchMore]);

  const retry = useCallback(() => { setLoadError(false); void fetchMore(); }, [fetchMore]);

  return { cards, setCards, fetching, initialLoaded, loadError, fetchMore, start, restart, retry };
}
