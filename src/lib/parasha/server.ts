import type { ParashaText, ParashaWeek } from '@/types/dailyLearning';
import { toBlocks, SefariaV1 } from '@/lib/dailyLearning/normalize';
import { bookletVerse } from '@/lib/tehillim/text';
import { ParashaPart, aliyaLabels, heTorahBook, heTorahRef } from './refs';

// Server-only: the week's parasha from Sefaria's calendar (Sephardi haftara,
// as the site follows עדות המזרח) and its text, through Next's data cache.
const BASE = 'https://www.sefaria.org';
const CAL_TTL = 6 * 3600;
const TEXT_TTL = 7 * 24 * 3600;

interface CalItem {
  title?: { en?: string };
  displayValue?: { he?: string };
  ref?: string;
  heRef?: string;
  url?: string;
  description?: { he?: string };
  extraDetails?: { aliyot?: string[] };
}
interface CalResp { calendar_items?: CalItem[] }

async function getJson<T>(url: string, ttl: number): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: ttl } });
    return res.ok ? await res.json() as T : null;
  } catch { return null; }
}

export async function fetchParashaWeek(date: string): Promise<ParashaWeek | null> {
  const [y, m, d] = date.split('-').map(Number);
  const cal = await getJson<CalResp>(
    `${BASE}/api/calendars?diaspora=0&custom=sephardi&year=${y}&month=${m}&day=${d}&timezone=Asia/Jerusalem`, CAL_TTL);
  const items = cal?.calendar_items ?? [];
  const p = items.find(c => c.title?.en === 'Parashat Hashavua');
  if (!p?.ref || !p.displayValue?.he) return null;
  const h = items.find(c => /^Haftarah/.test(c.title?.en ?? ''));
  const refs = p.extraDetails?.aliyot ?? [];
  const labels = aliyaLabels(refs.length);
  return {
    date,
    name: p.displayValue.he.replace(/^פרשת\s+/, ''),
    ref: p.ref,
    heRef: heTorahRef(p.ref) ?? p.heRef ?? p.ref,
    book: heTorahBook(p.ref),
    summary: p.description?.he?.trim() || null,
    aliyot: refs.map((ref, i) => ({ label: labels[i], ref, heRef: heTorahRef(ref) ?? ref })),
    haftarah: h?.ref ? { ref: h.ref, heRef: h.displayValue?.he ?? h.ref } : null,
    url: `${BASE}/${p.url ?? p.ref.replace(/ /g, '_')}`,
  };
}

/** The Sefaria ref for one part of the week (null when the week has no such part). */
export function partRef(week: ParashaWeek, part: ParashaPart): { ref: string; heRef: string } | null {
  if (part === 'all') return { ref: week.ref, heRef: week.heRef };
  if (part === 'h') return week.haftarah;
  return week.aliyot[part] ?? null;
}

const textUrl = (ref: string) =>
  `${BASE}/api/texts/${encodeURIComponent(ref.replace(/ /g, '_'))}?context=0&commentary=0&lang=he&pad=0`;

/** The text as numbered verses under chapter headings, without cantillation (vowels kept). */
export async function fetchParashaText(ref: string, heRef: string): Promise<ParashaText | null> {
  const main = await getJson<SefariaV1>(textUrl(ref), TEXT_TTL);
  if (!main) return null;
  const blocks = toBlocks(main, 'perek')
    .map(b => ({ ...b, segments: b.segments.map(s => ({ ...s, html: bookletVerse(s.html) })).filter(s => s.html) }))
    .filter(b => b.segments.length > 0);
  if (blocks.length === 0) return null;
  return {
    ref,
    heRef,
    url: `${BASE}/${ref.replace(/ /g, '_').replace(/:/g, '.')}`,
    version: main.heVersionTitle ?? null,
    license: main.heLicense ?? null,
    numbered: true,
    blocks,
  };
}
