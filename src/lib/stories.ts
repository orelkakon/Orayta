import type { StoryKey } from '@/types';

/** Auto-advance time per story in the viewer. */
export const STORY_DURATION_MS = 8000;

const KEY = 'orayta_stories_viewed';

interface ViewedRecord {
  date: string;
  keys: StoryKey[];
}

/**
 * Per-day viewed set — a record stored under another date counts as empty,
 * so every story wakes up "unread" again each morning.
 */
export function getViewedKeys(date: string): Set<StoryKey> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const rec = JSON.parse(raw) as ViewedRecord;
    return rec.date === date ? new Set(rec.keys) : new Set();
  } catch {
    return new Set();
  }
}

export function markStoryViewed(date: string, key: StoryKey): Set<StoryKey> {
  const keys = getViewedKeys(date);
  keys.add(key);
  try {
    localStorage.setItem(KEY, JSON.stringify({ date, keys: Array.from(keys) } satisfies ViewedRecord));
  } catch { /* storage unavailable — ring state just won't persist */ }
  return keys;
}

/**
 * Art direction per story category — a warm, curated gradient family so all
 * circles and cards read as one visual system. These are artwork constants
 * (like the feed's share-card accents), not theme tokens: they stay identical
 * in light and dark mode by design.
 */
export interface StoryArt {
  icon: string;       // LineIcons name for the circle glyph
  from: string;       // gradient start (deep tone)
  to: string;         // gradient end (lit tone)
  accent: string;     // "r,g,b" triplet — ring hue, card glow, badge tint
}

export const STORY_ART: Record<StoryKey, StoryArt> = {
  rabbi:    { icon: 'user',     from: '#3d2513', to: '#8a5a2e', accent: '226,168,98'  },
  rabbiQuiz:{ icon: 'search',   from: '#1c2733', to: '#4a6a8a', accent: '150,190,235' },
  citation: { icon: 'openbook', from: '#2c1d10', to: '#7a5a2a', accent: '232,203,118' },
  reel:     { icon: 'camera',   from: '#3a1626', to: '#8a3558', accent: '255,138,180' },
  parasha:  { icon: 'scroll',   from: '#1f2a1a', to: '#4f6b35', accent: '178,214,124' },
  halacha:  { icon: 'candle',   from: '#33210b', to: '#8a6a1e', accent: '244,203,94'  },
  sikum:    { icon: 'pencil',   from: '#2c1836', to: '#6b3f8a', accent: '214,150,244' },
  quiz:     { icon: 'target',   from: '#0f2f2b', to: '#2e7a6a', accent: '110,214,190' },
  chidush:  { icon: 'bulb',     from: '#3a2210', to: '#9a5a1e', accent: '255,158,84'  },
  tale:     { icon: 'flame',    from: '#301414', to: '#8a3030', accent: '255,148,128' },
  video:    { icon: 'play',     from: '#0f2c14', to: '#2f7a44', accent: '120,220,150' },
  gematria: { icon: 'aleph',    from: '#181d38', to: '#44508a', accent: '148,158,255' },
  daf:      { icon: 'calendar', from: '#0f2430', to: '#2f6076', accent: '120,196,224' },
};
