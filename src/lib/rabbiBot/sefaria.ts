import { toHebrewNumeral } from '@/lib/hebrewNumerals';
import { stripHtml } from './text';

// Server-only: Sefaria's public API (no key). Texts are cached by Next's data
// cache — a seif never changes — searches are not.
const BASE = 'https://www.sefaria.org';
const TEXT_TTL = 7 * 24 * 3600;
const TIMEOUT_MS = 9000;

export interface SefariaText {
  ref: string;
  heRef: string;
  book: string;
  /** One entry per segment (a ranged ref yields several). */
  segments: { ref: string; heRef: string; text: string }[];
}

interface V1Text {
  ref?: string; heRef?: string; heIndexTitle?: string; he?: unknown; error?: string;
  sections?: number[]; toSections?: number[]; isSpanning?: boolean; spanningRefs?: string[];
}

async function getJson<T>(url: string, init?: RequestInit & { next?: { revalidate: number } }): Promise<T | null> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    return res.ok ? await res.json() as T : null;
  } catch {
    return null;
  }
}

const enc = (ref: string) => encodeURIComponent(ref.replace(/ /g, '_'));
export const sefariaUrl = (ref: string) => `${BASE}/${enc(ref)}?lang=he`;

/** 31 → ל״א, 5 → ה׳ (Sefaria's heRef style). */
function heNumeral(n: number): string {
  const s = toHebrewNumeral(n);
  return s.length === 1 ? `${s}׳` : `${s.slice(0, -1)}״${s.slice(-1)}`;
}

const flat = (v: unknown): string[] => (Array.isArray(v) ? v.flatMap(flat) : typeof v === 'string' ? [v] : []);

/** A ref's Hebrew text; null when the ref doesn't exist (hallucinated refs fall out here). */
export async function fetchText(wanted: string): Promise<SefariaText | null> {
  const d = await getJson<V1Text>(`${BASE}/api/texts/${enc(wanted)}?context=0&commentary=0&lang=he&pad=0`,
    { next: { revalidate: TEXT_TTL } });
  if (!d || d.error || !d.ref) return null;
  const ref = d.ref;
  const heRef = d.heRef ?? ref;
  const first = d.sections?.length ? d.sections[d.sections.length - 1] : null;
  // A range within one section ("Mishnah Berurah 671:31-33") → one segment per
  // item with its own exact ref; a range of sections keeps the item's 1-based
  // position inside each section. Anything else stays one passage.
  const ranged = Array.isArray(d.he) && d.he.length > 1 && first !== null && !d.isSpanning && /\d-\d/.test(ref);
  const prefix = ref.replace(/\d+(-[\d:]+)?$/, '');
  const hePrefix = heRef.replace(/[^\s:]+(-\S+)?$/, '');
  const segments = !ranged || first === null
    ? [{ ref, heRef, text: flat(d.he).map(stripHtml).join(' ') }]
    : (d.he as unknown[]).flatMap((item, i) => {
      const n = first + i;
      if (!Array.isArray(item)) return [{ ref: `${prefix}${n}`, heRef: `${hePrefix}${heNumeral(n)}`, text: stripHtml(String(item ?? '')) }];
      return flat(item).map((t, j) => ({ ref: `${prefix}${n}:${j + 1}`, heRef: `${hePrefix}${heNumeral(n)}:${heNumeral(j + 1)}`, text: stripHtml(t) }));
    });
  const nonEmpty = segments.filter(s => s.text);
  if (nonEmpty.length === 0) return null;
  return { ref, heRef, book: d.heIndexTitle ?? heRef, segments: nonEmpty };
}

interface V1Link { ref?: string; index_title?: string; category?: string }

/** Refs linked to `ref` (commentaries, Talmud sources, later codes). */
export async function fetchLinks(ref: string): Promise<{ ref: string; book: string; category: string }[]> {
  const d = await getJson<V1Link[]>(`${BASE}/api/links/${enc(ref)}?with_text=0`, { next: { revalidate: TEXT_TTL } });
  if (!Array.isArray(d)) return [];
  return d.flatMap(l => (l.ref && l.index_title ? [{ ref: l.ref, book: l.index_title, category: l.category ?? '' }] : []));
}

interface SearchHit { _id?: string; _source?: { ref?: string } }

/**
 * Full-text search inside one category path (null = the whole library).
 * 'lemma' tolerates inflections and word gaps; 'exact' finds a quote as written.
 */
export async function searchRefs(query: string, path: string | null, size: number, mode: 'lemma' | 'exact' = 'lemma'): Promise<string[]> {
  const d = await getJson<{ hits?: { hits?: SearchHit[] } }>(`${BASE}/api/search-wrapper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query, type: 'text', field: mode === 'exact' ? 'exact' : 'naive_lemmatizer', size, slop: mode === 'exact' ? 0 : 6,
      filters: path ? [path] : [], filter_fields: path ? ['path'] : [], source_proj: ['ref'],
    }),
  });
  // _id is "<ref> (<version title> [he])"
  return (d?.hits?.hits ?? []).flatMap(h => {
    const ref = h._source?.ref ?? h._id?.replace(/\s*\([^()]*\[[a-z]{2}\]\)\s*$/, '');
    return ref ? [ref] : [];
  });
}
