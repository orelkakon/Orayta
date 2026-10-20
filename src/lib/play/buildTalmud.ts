import type { PlayLevel, PlayQuestion } from '@/types/play';
import { MASECHTOT, SEDARIM, dafToNumber } from '@/lib/hebrewData';
import { clip } from '@/lib/siteUrl';
import { HE } from '@/lib/hebrewTexts';
import { clipWords, shuffled, withOptions, type Rng } from './util';
import { dafLabel, lastDaf } from './talmudPages';

/** Talmud question builders — each returns null rather than an ambiguous question. */
export interface SrcCitation {
  id: string;
  content: string;
  locations: { masechet: string; seder: string; daf: string; amud: string | null }[];
}

const locLabel = (l: SrcCitation['locations'][number]) => `${l.masechet} ${l.daf}${l.amud ? ` ${l.amud}` : ''}`;
const where = (c: SrcCitation) => c.locations.map(locLabel).join(' · ');

export function masechetQ(c: SrcCitation, level: PlayLevel, rng: Rng): PlayQuestion | null {
  const right = c.locations[0]?.masechet;
  if (!right) return null;
  const own = new Set(c.locations.map(l => l.masechet));
  const seder = c.locations[0].seder;
  const others = MASECHTOT.filter(m => !own.has(m.name));
  const near = shuffled(others.filter(m => m.seder === seder), rng);
  const far = shuffled(others.filter(m => m.seder !== seder), rng);
  // easy: other sedarim only · normal: up to two from the same seder · hard: same seder first.
  const ordered = level === 'easy' ? far : level === 'hard' ? [...near, ...far] : [...near.slice(0, 2), ...far];
  return withOptions('masechet', HE.PLAY_Q_MASECHET, right, ordered.slice(0, 3).map(m => m.name), rng,
    { body: clip(c.content, 260), explain: where(c) });
}

const DAF_OFFSETS: Record<PlayLevel, number[]> = {
  easy: [-40, -30, -22, -15, 15, 22, 30, 40],
  normal: [-12, -9, -6, -4, 4, 6, 9, 12],
  hard: [-3, -2, -1, 1, 2, 3],
};

export function dafQ(c: SrcCitation, level: PlayLevel, rng: Rng): PlayQuestion | null {
  const loc = c.locations[0];
  const last = loc ? lastDaf(loc.masechet) : null;
  const n = loc ? dafToNumber(loc.daf) : 0;
  if (!loc || !last || n < 2 || n > last) return null;
  const taken = new Set(c.locations.filter(l => l.masechet === loc.masechet).map(l => dafToNumber(l.daf)));
  const wrong = shuffled(DAF_OFFSETS[level], rng).map(o => n + o).filter(d => d >= 2 && d <= last && !taken.has(d));
  const q = withOptions('daf', HE.PLAY_Q_DAF(loc.masechet), dafLabel(n), wrong.map(dafLabel), rng,
    { body: clip(c.content, 260), explain: where(c) });
  if (!q) return null;
  const options = [...q.options].sort((a, b) => dafToNumber(a) - dafToNumber(b));
  return { ...q, options, correct: options.indexOf(dafLabel(n)) };
}

/** Second half of a citation, clipped to a tile-friendly length. */
function split(content: string): { head: string; tail: string } | null {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length < 10) return null;
  const cut = Math.max(5, Math.round(words.length * 0.5));
  return { head: words.slice(0, cut).join(' '), tail: clipWords(words.slice(cut).join(' '), 70) };
}

export function completeQ(c: SrcCitation, all: SrcCitation[], rng: Rng): PlayQuestion | null {
  const parts = split(c.content);
  if (!parts) return null;
  const wrong = shuffled(all.filter(o => o.id !== c.id), rng)
    .map(o => split(o.content)?.tail).filter((t): t is string => !!t);
  return withOptions('complete', HE.PLAY_Q_COMPLETE, parts.tail, wrong, rng,
    { body: `${clipWords(parts.head, 200)} …`, explain: where(c) });
}

export function sederQ(m: { name: string; seder: string }, rng: Rng): PlayQuestion | null {
  const wrong = shuffled(SEDARIM.filter(s => s !== m.seder), rng);
  const count = MASECHTOT.filter(x => x.seder === m.seder).length;
  return withOptions('seder', HE.PLAY_Q_SEDER(m.name), m.seder, wrong, rng, { explain: HE.PLAY_EXPLAIN_SEDER(m.seder, count) });
}
