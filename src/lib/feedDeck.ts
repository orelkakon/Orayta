// Persist the feed deck (seed + page position) across visits, so the deck
// keeps dealing unseen items instead of reshuffling on every session start.
// Fair rotation: nothing repeats until the whole pool has been shown.

const KEY = 'orayta_feed_deck';

export interface FeedDeck {
  seed: number;
  page: number;
}

export function freshFeedDeck(): FeedDeck {
  return { seed: Math.floor(Math.random() * 4294967296), page: 0 };
}

export function saveFeedDeck(deck: FeedDeck): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(deck));
  } catch {
    /* private mode / storage full — deck stays session-only */
  }
}

export function loadFeedDeck(): FeedDeck {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<FeedDeck>;
      if (
        typeof d.seed === 'number' && Number.isFinite(d.seed) &&
        typeof d.page === 'number' && Number.isFinite(d.page) && d.page >= 0
      ) {
        return { seed: d.seed >>> 0, page: Math.floor(d.page) };
      }
    }
  } catch {
    /* corrupt value — replace below */
  }
  const fresh = freshFeedDeck();
  saveFeedDeck(fresh);
  return fresh;
}
