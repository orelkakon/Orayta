import type { LearnItem, LearnText, LearnToday } from '@/types/dailyLearning';
import { LEARN_KINDS, learnKind } from './kinds';
import { toBlocks, attachExplain, SefariaV1 } from './normalize';

// Server-only: Sefaria's learning calendar and texts, through Next's data
// cache (texts never change; the calendar is keyed by date in its URL).
const BASE = 'https://www.sefaria.org';
const TEXT_TTL = 7 * 24 * 3600;
const CAL_TTL = 6 * 3600;

interface CalItem { title?: { en?: string }; displayValue?: { he?: string }; ref?: string; url?: string; }
interface CalResp { calendar_items?: CalItem[]; }

async function getJson<T>(url: string, ttl: number): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: ttl } });
    return res.ok ? await res.json() as T : null;
  } catch {
    return null;
  }
}

export async function fetchLearnToday(date: string): Promise<LearnToday | null> {
  const [y, m, d] = date.split('-').map(Number);
  const cal = await getJson<CalResp>(
    `${BASE}/api/calendars?diaspora=0&year=${y}&month=${m}&day=${d}&timezone=Asia/Jerusalem`, CAL_TTL);
  if (!cal?.calendar_items) return null;
  const items: LearnItem[] = LEARN_KINDS.flatMap(def => {
    const ci = cal.calendar_items?.find(c => c.title?.en === def.sefariaTitle);
    if (!ci?.ref || !ci.url) return [];
    return [{ kind: def.kind, he: ci.displayValue?.he ?? ci.ref, ref: ci.ref, url: `${BASE}/${ci.url}` }];
  });
  // On holidays this is the festival reading ("שבת חוהמ פסח"), which is what we want to show.
  const parasha = cal.calendar_items.find(c => c.title?.en === 'Parashat Hashavua')?.displayValue?.he ?? null;
  return { date, parasha, items };
}

const textUrl = (ref: string) =>
  `${BASE}/api/texts/${encodeURIComponent(ref.replace(/ /g, '_'))}?context=0&commentary=0&lang=he&pad=0`;

export async function fetchLearnText(item: LearnItem, withExplain: boolean): Promise<LearnText | null> {
  const def = learnKind(item.kind);
  const explainOn = withExplain && def.explain;
  const [main, expl] = await Promise.all([
    getJson<SefariaV1>(textUrl(item.ref), TEXT_TTL),
    explainOn ? getJson<SefariaV1>(textUrl(`Steinsaltz on ${item.ref}`), TEXT_TTL) : Promise.resolve(null),
  ]);
  if (!main) return null;
  let blocks = toBlocks(main, def.heading);
  if (blocks.length === 0) return null;
  if (expl) blocks = attachExplain(blocks, toBlocks(expl, def.heading));
  return {
    kind: item.kind,
    ref: item.ref,
    heRef: main.heRef ?? item.he,
    url: item.url,
    version: main.heVersionTitle ?? null,
    license: main.heLicense ?? null,
    numbered: def.numbered,
    explained: Boolean(expl),
    blocks,
  };
}
