import type { PrayerPart } from './types';

type Special = Omit<PrayerPart, 'node'>;

/**
 * Builds the parts of `node` from segment `from` to `to`: the listed
 * special slices (marks, conditional inserts) in place, and the plain text
 * between them filled in — so a map only names what is special.
 */
export function fill(node: string, from: number, to: number, specials: Special[]): PrayerPart[] {
  const parts: PrayerPart[] = [];
  let cursor = from;
  for (const s of [...specials].sort((a, b) => a.from - b.from)) {
    if (s.from > cursor) parts.push({ node, from: cursor, to: s.from - 1 });
    parts.push({ node, ...s });
    cursor = s.to + 1;
  }
  if (cursor <= to) parts.push({ node, from: cursor, to });
  return parts;
}
