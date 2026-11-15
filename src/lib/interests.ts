/**
 * Home personalisation by interest. The visitor picks what interests them
 * once (the home card) and can change it any time (the "עוד" settings);
 * the choice stays on the device. The admin can turn the whole thing off
 * (`AppConfig` `home_personalize`), and then everyone gets the same home.
 *
 * The pure helpers here are tested (tests/interests.test.ts).
 */
export const INTEREST_IDS = ['prayer', 'learning', 'knowledge', 'community'] as const;
export type Interest = typeof INTEREST_IDS[number];

export interface InterestPrefs {
  picked: Interest[];
  /** The card was answered or dismissed — it never shows again. */
  asked: boolean;
}

export const NO_PREFS: InterestPrefs = { picked: [], asked: false };

const isInterest = (v: unknown): v is Interest => typeof v === 'string' && (INTEREST_IDS as readonly string[]).includes(v);

export function parsePrefs(raw: string | null): InterestPrefs {
  try {
    const v = JSON.parse(raw ?? 'null') as Partial<InterestPrefs> | null;
    if (!v || typeof v !== 'object') return NO_PREFS;
    const picked = Array.isArray(v.picked) ? INTEREST_IDS.filter(id => v.picked!.some(p => p === id && isInterest(p))) : [];
    return { picked, asked: v.asked === true };
  } catch { return NO_PREFS; }
}

/* ---------- what the interests change on home ---------- */

export interface Tile { href: string; icon: string; label: string; tags?: Interest[] }

/**
 * The quick-access tiles: without interests, exactly the default set; with
 * them, the `count` tiles that match the most picked interests (ties keep
 * the pool's order, so the default tiles win among equals).
 */
export function pickTiles(defaults: Tile[], pool: Tile[], picked: Interest[], count = defaults.length): Tile[] {
  if (picked.length === 0) return defaults;
  const all = [...defaults, ...pool.filter(p => !defaults.some(d => d.href === p.href))];
  const score = (t: Tile) => (t.tags ?? []).filter(tag => picked.includes(tag)).length;
  const chosen = all
    .map((t, i) => ({ t, i, s: score(t) }))
    .sort((a, b) => (b.s - a.s) || (a.i - b.i))
    .slice(0, count);
  // Show them in their natural order, not by score.
  return chosen.sort((a, b) => a.i - b.i).map(c => c.t);
}

/** A home block and the interests it serves. */
export interface Block<K extends string = string> { key: K; tags: Interest[] }

/**
 * Orders a column's blocks: those serving more picked interests come first;
 * equals (and everything, without interests) keep the default order.
 */
export function orderBlocks<K extends string>(blocks: Block<K>[], picked: Interest[]): K[] {
  if (picked.length === 0) return blocks.map(b => b.key);
  return blocks
    .map((b, i) => ({ k: b.key, i, s: b.tags.filter(t => picked.includes(t)).length }))
    .sort((a, b) => (b.s - a.s) || (a.i - b.i))
    .map(b => b.k);
}

/* ---------- device storage (browser only) ---------- */

const KEY = 'orayta_interests';
const CFG_KEY = 'orayta_home_cfg';
const CHANGE = 'orayta:interests';
const OPEN = 'orayta:interests-open';

export function readPrefs(): InterestPrefs {
  try { return parsePrefs(localStorage.getItem(KEY)); } catch { return NO_PREFS; }
}

export function savePrefs(p: InterestPrefs): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* blocked: this page only */ }
  window.dispatchEvent(new CustomEvent<InterestPrefs>(CHANGE, { detail: p }));
}

export function onPrefsChange(cb: (p: InterestPrefs) => void): () => void {
  const onCustom = (e: Event) => cb((e as CustomEvent<InterestPrefs>).detail);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) cb(parsePrefs(e.newValue)); };
  window.addEventListener(CHANGE, onCustom);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(CHANGE, onCustom); window.removeEventListener('storage', onStorage); };
}

/** The admin switch as last seen on this device, so a repeat visit renders right at once. */
export function readCachedEnabled(): boolean | null {
  try {
    const v = localStorage.getItem(CFG_KEY);
    return v === '1' ? true : v === '0' ? false : null;
  } catch { return null; }
}

export function cacheEnabled(on: boolean): void {
  try { localStorage.setItem(CFG_KEY, on ? '1' : '0'); } catch { /* ignore */ }
}

export function openInterests(): void {
  window.dispatchEvent(new Event(OPEN));
}

export function onOpenInterests(cb: () => void): () => void {
  window.addEventListener(OPEN, cb);
  return () => window.removeEventListener(OPEN, cb);
}
