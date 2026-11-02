/**
 * Pure rules for building the tzadikim-graves dataset (tested): which names
 * are graves, who is buried there, which OSM-only tombs to keep, when two
 * records are one site.
 */
import { haversineM } from '@/lib/minyan/geo';

const GRAVE_PREFIX = /^(?:ציון\s+קבר|ציון|קברי|קבר|מערת|מצבת)\s+(.+)$/;
/* "אוהל" is also a hall, a tent camp, a synagogue — a grave only with a tzadik's title. */
const OHEL_PREFIX = /^אוהל\s+(.+)$/;

const TITLE = /(רבי|רבן|הרב|^רב\s|\sרב\s|ר['׳]\s|הנביא|הצדיק|אדמו["״]ר|בבא|אבא\s|התנא|האמורא|המקובל|בן יעקב|המלך|אמנו|אבינו|האימהות|האמהות|התנאים)/;
/* Acronyms in quotes (הרמב"ם, האר"י) also mark a tzadik — but not for "אוהל", a common hall name. */
const TZADIK = new RegExp(`${TITLE.source}|["״]`);

/**
 * "קבר רבי שמעון בר יוחאי" → "רבי שמעון בר יוחאי"; "קבר הנביא חבקוק (איראן)" →
 * "הנביא חבקוק". null when the name isn't a grave's ("גוש חלב", "מערת קבורה").
 */
export function personFromSite(title: string): string | null {
  const t = title.replace(/\s+/g, ' ').trim();
  const ohel = OHEL_PREFIX.exec(t);
  const m = GRAVE_PREFIX.exec(t) ?? (ohel && TITLE.test(ohel[1]) ? ohel : null);
  if (!m) return null;
  const rest = m[1].replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+(?:ז["״]ל|זצ["״]ל|זיע["״]א)$/, '').trim();
  if (!rest || /^(?:ה?קבורה|חצובה)/.test(rest)) return null;
  return rest;
}

/* Not tzadikim graves: archaeology, memorials, other faiths' shrines, state figures. */
const BLOCK = new RegExp([
  'מערת\\s+ה?קבורה', 'קבורה\\s+חצובה', '^קברי\\s+בית', 'מצבת', 'זי?כרון', 'חללי', 'משפחת',
  'שי?יח', 'ש[יי]?ח[׳\']', 'קולומבריום', 'קומראן', 'נפוליאון', 'בבוקריום', 'הפעמון', 'קסם', 'הפליטים',
  'הקנאים', 'המלכים', 'ניקנור', 'האשכולות', 'יוחנן המטביל', 'הורדוס',
  'יאסון', 'בני חזיר', 'בת פרעה', 'כבארה', 'עלמה', 'טורקית', 'מקאם', 'נבי ',
  'אוהל ש["״]י', 'הרצל', 'בן.?גוריון', 'וייצמן', 'רפול', 'הר ציון', 'ז\'בוטינסקי', 'רבין', 'בגין', 'רחבעם', 'שז["״]ר',
].join('|'));

/** Names that are never a tzadik's grave, whatever the source. */
export const isBlocked = (name: string) => BLOCK.test(name);

/** Keep an OSM tomb that no Wikipedia grave page covers? */
export function keepOsm(tags: Record<string, string | number>): boolean {
  const name = String(tags['name:he'] ?? tags.name ?? '').trim();
  if (!name || BLOCK.test(name)) return false;
  const graveNamed = personFromSite(name) !== null;
  if (/^אוהל\s/.test(name) && !graveNamed) return false;
  if (!graveNamed && tags.historic !== 'tomb' && !('tomb' in tags)) return false;
  return tags.religion === 'jewish' || TZADIK.test(name);
}

const GENERIC = new Set(['קבר', 'קברי', 'ציון', 'מערת', 'אוהל', 'רבי', 'רב', 'הרב', 'ר', 'הקדוש', 'זצל', 'זל', 'בן', 'בר', 'הנביא', 'הצדיק']);

export function siteTokens(name: string): Set<string> {
  const plain = name.replace(/[֑-ׇ]/g, '').replace(/["'״׳`.,()\-–—_/\\]/g, ' ');
  return new Set(plain.split(/\s+/).filter(t => t.length >= 2 && !GENERIC.has(t)));
}

/** Same grave: very close, or near with a shared distinguishing name word. */
export function sameSite(a: { name: string; lat: number; lng: number }, b: { name: string; lat: number; lng: number }): boolean {
  const d = haversineM(a.lat, a.lng, b.lat, b.lng);
  if (d <= 40) return true;
  if (d > 500) return false;
  const ta = siteTokens(a.name), tb = siteTokens(b.name);
  return Array.from(ta).some(t => tb.has(t));
}

/** Wikipedia intro → at most ~320 chars, cut at a sentence end. */
export function cleanExtract(text: string | undefined | null): string | null {
  const t = text?.replace(/\s+/g, ' ').replace(/\(\s*\)/g, '').trim();
  if (!t || t.length < 20) return null;
  if (t.length <= 320) return t;
  const cut = t.slice(0, 320);
  const end = cut.lastIndexOf('.');
  return end > 120 ? cut.slice(0, end + 1) : `${cut.trimEnd()}…`;
}
