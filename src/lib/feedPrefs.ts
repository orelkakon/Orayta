import type { FeedItemType } from '@/types';

const KEY = 'orayta_feed_prefs';

export const ALL_FEED_TYPES: FeedItemType[] = [
  'citation', 'rabbi', 'book', 'chidush', 'gematria', 'sikum',
];

export function getFeedPrefs(): FeedItemType[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return ALL_FEED_TYPES;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return ALL_FEED_TYPES;
    const valid = ALL_FEED_TYPES.filter(t => (parsed as string[]).includes(t));
    return valid.length > 0 ? valid : ALL_FEED_TYPES;
  } catch {
    return ALL_FEED_TYPES;
  }
}

export function saveFeedPrefs(types: FeedItemType[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(types)); } catch {}
}
