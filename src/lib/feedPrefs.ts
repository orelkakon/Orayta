import type { FeedItemType } from '@/types';

const KEY = 'orayta_feed_prefs';

export const ALL_FEED_TYPES: FeedItemType[] = [
  'citation', 'rabbi', 'book', 'chidush', 'gematria', 'sikum',
];

export interface FeedPrefs {
  types: FeedItemType[];
  reels: boolean;
  dedications: boolean;
}

export const DEFAULT_FEED_PREFS: FeedPrefs = {
  types: ALL_FEED_TYPES,
  reels: true,
  dedications: true,
};

function validTypes(raw: unknown): FeedItemType[] {
  if (!Array.isArray(raw)) return ALL_FEED_TYPES;
  const valid = ALL_FEED_TYPES.filter(t => (raw as string[]).includes(t));
  return valid.length > 0 ? valid : ALL_FEED_TYPES;
}

export function getFeedPrefs(): FeedPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_FEED_PREFS;
    const parsed: unknown = JSON.parse(raw);
    // Legacy format: a plain array of types
    if (Array.isArray(parsed)) return { ...DEFAULT_FEED_PREFS, types: validTypes(parsed) };
    const obj = parsed as Partial<FeedPrefs>;
    return {
      types: validTypes(obj.types),
      reels: obj.reels !== false,
      dedications: obj.dedications !== false,
    };
  } catch {
    return DEFAULT_FEED_PREFS;
  }
}

export function saveFeedPrefs(prefs: FeedPrefs): void {
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch {}
}

export function isCustomPrefs(prefs: FeedPrefs): boolean {
  return prefs.types.length < ALL_FEED_TYPES.length || !prefs.reels || !prefs.dedications;
}
