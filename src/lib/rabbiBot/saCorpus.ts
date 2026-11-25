import { readFileSync } from 'fs';
import { join } from 'path';
import { toHebrewNumeral } from '@/lib/hebrewNumerals';
import TITLES from './data/sa-toc.json';
import { buildSaIndex, SaData, SaIndex } from './saIndex';
import type { SefariaText } from './sefaria';

// Server-only: the whole Shulchan Arukh on disk (data/sa-text.json, built by
// scripts/sa-text.ts, shipped with the ask route via outputFileTracingIncludes).
// It is searched locally (saSearch.ts) and serves Shulchan Arukh passages
// without a request to Sefaria — the same versions and cleaning as fetchText.

const FILE = join(process.cwd(), 'src', 'lib', 'rabbiBot', 'data', 'sa-text.json');
const HE_PART: Record<string, string> = {
  'Orach Chayim': 'אורח חיים', "Yoreh De'ah": 'יורה דעה', 'Even HaEzer': 'אבן העזר', 'Choshen Mishpat': 'חושן משפט',
};

let data: SaData | null | undefined;
let built: Promise<SaIndex | null> | null = null;

function load(): SaData | null {
  if (data !== undefined) return data;
  try {
    data = JSON.parse(readFileSync(FILE, 'utf8')) as SaData;
  } catch (e) {
    console.warn('[sa] corpus unavailable, falling back to Sefaria:', e instanceof Error ? e.message : e);
    data = null;
  }
  return data;
}

/**
 * The search index, built once per server instance (~0.7 s). The first call
 * schedules the build for the next tick, so a request that starts it right
 * away overlaps it with its database round trips (Prisma's engine runs on its
 * own thread). null when the corpus file is missing — callers fall back to Sefaria.
 */
export function saIndex(): Promise<SaIndex | null> {
  return built ??= new Promise(resolve => setImmediate(() => {
    const d = load();
    resolve(d ? buildSaIndex(d, TITLES as Record<string, string[]>) : null);
  }));
}

/** 31 → ל״א, 5 → ה׳ (Sefaria's heRef style). */
export function heNumeral(n: number): string {
  const s = toHebrewNumeral(n);
  return s.length === 1 ? `${s}׳` : `${s.slice(0, -1)}״${s.slice(-1)}`;
}

const REF = /^Shulchan Arukh, (Orach Chayim|Yoreh De'ah|Even HaEzer|Choshen Mishpat) (\d+)(?::(\d+)(?:-(\d+))?)?$/;

/**
 * A Shulchan Arukh ref from the local corpus, shaped exactly as fetchText
 * returns it: a whole siman ("…89") or one seif as one passage, a range
 * ("…204:1-99", clamped to the siman) one segment per seif. null when the
 * ref isn't a Shulchan Arukh one, doesn't exist, or the corpus is missing.
 */
export function localSaText(wanted: string): SefariaText | null {
  const m = wanted.match(REF);
  const d = m ? load() : null;
  if (!m || !d) return null;
  const [, part, s, from, to] = m;
  const siman = Number(s);
  const seifim = d.text[part]?.[siman - 1];
  if (!seifim?.length) return null;
  const book = `שולחן ערוך, ${HE_PART[part]}`;
  const heSiman = `${book} ${heNumeral(siman)}`;
  const one = (ref: string, heRef: string, text: string): SefariaText | null =>
    (text ? { ref, heRef, book, segments: [{ ref, heRef, text }] } : null);
  if (!from) return one(wanted, heSiman, seifim.filter(Boolean).join(' '));
  const a = Number(from);
  if (!to) return one(wanted, `${heSiman}:${heNumeral(a)}`, seifRange(seifim, a, a)[0]?.text ?? '');
  const b = Number(to);
  const segments = seifRange(seifim, a, b).map(x => ({
    ref: `Shulchan Arukh, ${part} ${siman}:${x.n}`, heRef: `${heSiman}:${heNumeral(x.n)}`, text: x.text,
  }));
  return segments.length ? { ref: wanted, heRef: `${heSiman}:${heNumeral(a)}-${heNumeral(b)}`, book, segments } : null;
}

/** Seifim a..b (1-based, clamped), non-empty only. */
function seifRange(seifim: string[], a: number, b: number) {
  return seifim.slice(a - 1, b).map((text, i) => ({ n: a + i, text })).filter(x => x.text);
}
