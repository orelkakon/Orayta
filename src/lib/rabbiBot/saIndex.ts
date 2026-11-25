import { normWord } from './text';
import { textKeys } from './stem';
import { sectionAliases } from './vocab';

/**
 * The index behind the local Shulchan Arukh search (saSearch.ts): every seif
 * of the four parts (data/sa-text.json, loaded by saCorpus.ts) under the word
 * keys of stem.ts, plus two short fields of each siman — its title (data/sa-toc.json)
 * and its hilchot ("הלכות שבת"), so "מותר לכתוב בשבת" lands in hilchot
 * Shabbat although the seif itself only says "הכותב". Pure.
 */

/** A part's hilchot: "הלכות ציצית" = simanim 8–24. */
export interface SaSection { name: string; from: number; to: number }
/** part → simanim → seifim (plain text, cleaned as fetchText cleans it), and each part's hilchot. */
export interface SaData { text: Record<string, string[][]>; hilchot: Record<string, SaSection[]> }
export type SaTitles = Record<string, string[]>;

export interface Doc { part: string; siman: number; seif: number; len: number }

/** A short field (titles, hilchot): key → the simanim / sections holding it, and how many there are. */
export interface Field { keys: Map<string, Set<string>>; count: number }

export interface SaIndex {
  docs: Doc[];
  /** word (as written) → [doc, tf, doc, tf, …], in document order. */
  postings: Map<string, number[]>;
  /** key (stem.ts) → the words found under it, and about how many documents hold them. */
  vocab: Map<string, { words: string[]; df: number }>;
  avgLen: number;
  titles: Field;
  /** Keyed by section id ("<part>#<n>"). */
  sections: Field;
  /** siman key → the ids of the sections it belongs to. */
  sectionOf: Map<string, string[]>;
}

/** "דיני הברכות ליתר מאכלים. ובו יג סעיפים: …" — a siman's first seif opens with its title. */
const HEADING = /^.{3,160}?\.?\s*ובו\s+(?:סעיף אחד|[א-ת"״׳']{1,4}\s+סעיפים)[.:]?\s*/;

// The corpus has ~720k words but ~70k distinct spellings: each is normalized once.
const normal = new Map<string, string>();
const norm = (raw: string) => {
  let w = normal.get(raw);
  if (w === undefined) normal.set(raw, w = normWord(raw));
  return w;
};
/** The words of a text in comparison form (as tokenize splits them), two letters and up. */
/** A seif's own words: the first seif of a siman without the title it opens with. */
export const seifBody = (text: string, seif: number) => (seif === 1 ? text.replace(HEADING, '') : text);

export const words = (text: string) => text.split(/[\s\u05BE\-–—/⟦⟧]+/).map(norm).filter(w => w.length >= 2);
export const simanKey = (part: string, siman: number) => `Shulchan Arukh, ${part} ${siman}`;

function field(entries: { id: string; text: string }[]): Field {
  const keys = new Map<string, Set<string>>();
  entries.forEach(({ id, text }) => words(text).forEach(w => textKeys(w).forEach(k => {
    const set = keys.get(k) ?? new Set<string>();
    set.add(id);
    keys.set(k, set);
  })));
  return { keys, count: entries.length };
}

export function buildSaIndex(data: SaData, titles: SaTitles): SaIndex {
  const docs: Doc[] = [];
  // Postings per word as written (~600k words, ~90k distinct); a word's keys are worked out once, below.
  const postings = new Map<string, number[]>();
  let total = 0;
  for (const [part, simanim] of Object.entries(data.text)) {
    simanim.forEach((seifim, i) => seifim.forEach((raw, j) => {
      const ws = words(seifBody(raw, j + 1));
      const tf = new Map<string, number>();
      for (const w of ws) tf.set(w, (tf.get(w) ?? 0) + 1);
      const doc = docs.length;
      docs.push({ part, siman: i + 1, seif: j + 1, len: ws.length });
      total += ws.length;
      tf.forEach((n, w) => {
        const list = postings.get(w);
        if (list) list.push(doc, n); else postings.set(w, [doc, n]);
      });
    }));
  }
  const byKey = new Map<string, string[]>();
  postings.forEach((_, w) => textKeys(w).forEach(k => {
    const list = byKey.get(k);
    if (list) list.push(w); else byKey.set(k, [w]);
  }));
  // A key's document frequency: its words' together (an overcount where they share a seif — rarity only needs the order of magnitude).
  const vocab = new Map<string, { words: string[]; df: number }>();
  byKey.forEach((ws, k) => vocab.set(k, { words: ws, df: Math.min(docs.length, ws.reduce((n, w) => n + postings.get(w)!.length / 2, 0)) }));
  const titleField = field(Object.entries(titles).flatMap(([part, list]) =>
    list.flatMap((text, i) => (text ? [{ id: simanKey(part, i + 1), text }] : []))));
  const sectionOf = new Map<string, string[]>();
  const sectionEntries = Object.entries(data.hilchot).flatMap(([part, list]) => list.map((s, n) => {
    const id = `${part}#${n}`;
    for (let siman = s.from; siman <= s.to; siman++) {
      const key = simanKey(part, siman);
      sectionOf.set(key, [...(sectionOf.get(key) ?? []), id]);
    }
    return { id, text: [s.name, ...sectionAliases(s.name)].join(' ') };
  }));
  return { docs, postings, vocab, avgLen: total / Math.max(1, docs.length), titles: titleField, sections: field(sectionEntries), sectionOf };
}
