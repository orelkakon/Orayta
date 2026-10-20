import type { LearnBlock } from '@/types/dailyLearning';
import type { HeadingKind } from './kinds';
import { sanitizeSiddurHtml } from '@/lib/siddur/sanitize';
import { dayToLetters } from '@/lib/hebrewDate';
import { HE } from '@/lib/hebrewTexts';

/** The fields of Sefaria's v1 texts API we rely on. */
export interface SefariaV1 {
  he?: unknown;
  heRef?: string;
  sections?: (number | string)[];
  isSpanning?: boolean;
  spanningRefs?: string[];
  heVersionTitle?: string;
  heLicense?: string;
}

/**
 * Sefaria segment HTML → our presentational subset: footnotes and the empty
 * marker tags (commentator anchors, Vilna page overlays) are dropped first.
 */
export function cleanSegment(html: string): string {
  const noNotes = html
    .replace(/<sup[^>]*class="footnote-marker"[^>]*>[\s\S]*?<\/sup>/g, '')
    .replace(/<i[^>]*class="footnote"[^>]*>[\s\S]*?<\/i>/g, '');
  return sanitizeSiddurHtml(noNotes).replace(/<(i|b|small|strong|em)><\/\1>/g, '').replace(/\s{2,}/g, ' ').trim();
}

function flatten(x: unknown): string[] {
  if (typeof x === 'string') return [x];
  return Array.isArray(x) ? x.flatMap(flatten) : [];
}

const AMUD_LETTER: Record<string, string> = { a: 'א׳', b: 'ב׳' };

function headingFor(kind: HeadingKind, i: number, d: SefariaV1): string | null {
  const sections = d.sections ?? [];
  if (kind === 'amud') {
    const m = /(\d+)([ab])$/.exec(d.spanningRefs?.[i] ?? '');
    return m ? HE.LEARN_AMUD(dayToLetters(Number(m[1])), AMUD_LETTER[m[2]]) : null;
  }
  const base = Number(sections.length >= 2 ? sections[sections.length - 2] : sections[0]);
  return Number.isFinite(base) ? `${HE.LEARN_HEADING[kind]} ${dayToLetters(base + i)}` : null;
}

/**
 * One portion as blocks of numbered segments. A spanning ref (several
 * chapters / amudim) comes back as an array per unit; the first unit may
 * start mid-way (Joshua 22:34-24:33 → 34, then 1, 1).
 */
export function toBlocks(d: SefariaV1, heading: HeadingKind): LearnBlock[] {
  const sections = d.sections ?? [];
  const firstStart = sections.length >= 2 ? Number(sections[sections.length - 1]) || 1 : 1;
  const he = d.he;
  const units: unknown[] = Array.isArray(he) && d.isSpanning && he.some(Array.isArray) ? he : [he];
  return units.map((unit, i) => {
    const start = i === 0 ? firstStart : 1;
    const segments = flatten(unit)
      .map((raw, j) => ({ n: start + j, html: cleanSegment(raw) }))
      .filter(s => s.html.length > 0);
    return { heading: units.length > 1 ? headingFor(heading, i, d) : null, segments };
  }).filter(b => b.segments.length > 0);
}

/** Attaches a parallel commentary (same shape) segment by segment. */
export function attachExplain(blocks: LearnBlock[], explain: LearnBlock[]): LearnBlock[] {
  return blocks.map((b, i) => {
    const byN = new Map((explain[i]?.segments ?? []).map(s => [s.n, s.html]));
    return { ...b, segments: b.segments.map(s => ({ ...s, explain: byN.get(s.n) })) };
  });
}
