import type { TehillimPurpose, TehillimState } from '@/types/tehillim';
import { HE } from '@/lib/hebrewTexts';
import { SITE_URL } from '@/lib/siteUrl';

/**
 * This device's side of חלוקת תהילים (localStorage `orayta_tehillim`): the
 * reader key (anonymous identity across readings), the organizer keys of the
 * readings opened here, the readings joined, and the name the reader gave.
 */
const KEY = 'orayta_tehillim';

export interface MyCircle { slug: string; heading: string; manageKey?: string; at: number }
interface Local { reader: string; name: string; circles: MyCircle[] }

function read(): Local {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Local> | null;
    if (raw && typeof raw.reader === 'string') return { reader: raw.reader, name: raw.name ?? '', circles: Array.isArray(raw.circles) ? raw.circles : [] };
  } catch {}
  const fresh: Local = { reader: randomKey(), name: '', circles: [] };
  write(fresh);
  return fresh;
}

function write(v: Local) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} }

function randomKey(): string {
  const b = new Uint8Array(18);
  crypto.getRandomValues(b);
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}

export const readerKey = () => read().reader;
export const savedName = () => read().name;
export const saveName = (name: string) => { const v = read(); write({ ...v, name }); };
export const myCircles = () => read().circles.slice().sort((a, b) => b.at - a.at);
export const manageKeyFor = (slug: string) => read().circles.find(c => c.slug === slug)?.manageKey ?? null;

/** Remembers a reading on this device (keeps an organizer key once known). */
export function rememberCircle(slug: string, heading: string, manageKey?: string) {
  const v = read();
  const old = v.circles.find(c => c.slug === slug);
  const next: MyCircle = { slug, heading, manageKey: manageKey ?? old?.manageKey, at: Date.now() };
  write({ ...v, circles: [next, ...v.circles.filter(c => c.slug !== slug)].slice(0, 30) });
}

export const forgetCircle = (slug: string) => { const v = read(); write({ ...v, circles: v.circles.filter(c => c.slug !== slug) }); };

/** "משה בן שרה ושרה בת רחל" — the names, as one line. */
export function namesLine(names: string[]): string {
  return names.length <= 1 ? names[0] ?? '' : `${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}`;
}

/** "לרפואת משה בן שרה ושרה בת רחל" — what the reading is for. */
export function headingOf(purpose: TehillimPurpose, names: string[]): string {
  const list = namesLine(names);
  const prefix = HE.TH_PURPOSES[purpose].prefix;
  return prefix ? `${prefix} ${list}` : list;
}

export const circleUrl = (slug: string) => `${SITE_URL}/tehillim/${slug}`;
export const manageUrl = (slug: string, key: string) => `${circleUrl(slug)}#m=${key}`;

export function shareText(state: Pick<TehillimState, 'slug' | 'purpose' | 'names' | 'stats'>): string {
  return HE.TH_SHARE_LINES(headingOf(state.purpose, state.names), circleUrl(state.slug), state.stats.chapters).join('\n');
}

/** API call with this device's reader (and organizer) key. */
export async function thFetch<T>(path: string, init: RequestInit & { manageKey?: string | null } = {}): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-tehillim-reader': readerKey() };
  if (init.manageKey) headers['x-tehillim-manage'] = init.manageKey;
  try {
    const res = await fetch(path, { ...init, headers, cache: 'no-store' });
    if (res.status === 204) return { ok: true, data: null as T };
    const body = await res.json().catch(() => ({})) as T & { error?: string };
    return res.ok ? { ok: true, data: body } : { ok: false, status: res.status, error: body.error ?? 'unavailable' };
  } catch {
    return { ok: false, status: 0, error: 'network' };
  }
}
