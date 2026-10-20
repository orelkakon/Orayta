/**
 * Teacher / family links read out of the rabbis' bios. Precision over recall:
 * a link exists only when a fixed relation phrase is followed by a name that
 * is EXACTLY one rabbi in the directory and then a clear boundary (end,
 * punctuation or "ו" + the next name). "תלמיד רב הונא" therefore never links
 * to "רב", and an unknown name simply yields nothing.
 */

export interface RelRabbi { id: string; name: string; fullName: string | null; bio: string; }

/** `from` is the teacher / father / grandfather / father-in-law of `to`. */
export type RelKind = 'teacher' | 'father' | 'grandfather' | 'fatherInLaw';
export interface Relation { kind: RelKind; from: string; to: string; }

/** Folds the quote-mark variants (״ " ׳ ') so "רשב"א" matches "רשב״א". */
export const foldQuotes = (s: string) => s.replace(/[״"]/g, '"').replace(/[׳']/g, "'");

/** Phrase in X's bio → how the named rabbi relates to X. */
const PHRASES: { re: RegExp; kind: RelKind; named: 'from' | 'to' }[] = [
  // X is the student of N: "תלמידו של", "תלמיד", "תלמידם של", "תלמידו המובהק של", "תלמידו וממשיכו של", "מתלמידי"
  { re: /(?:^|[\s,(])(?:מ|ו|גדול |מגדולי )?תלמיד(?:ו|ם|י)?(?: (?:ה)?(?:מובהק|נאמן))?(?: ו[^\s,.]+)?(?: של)? /g, kind: 'teacher', named: 'from' },
  // X is the teacher of N: "רבו של", "ורבו של", "מרבותיו של"
  { re: /(?:^|[\s,(])(?:ו|מ)?(?:רבו|רבותיו) של /g, kind: 'teacher', named: 'to' },
  { re: /(?:^|[\s,(])(?:ו)?(?:בנו|בנם) של /g, kind: 'father', named: 'from' },
  { re: /(?:^|[\s,(])(?:ו)?נכדו של /g, kind: 'grandfather', named: 'from' },
  { re: /(?:^|[\s,(])(?:ו)?חתנו של /g, kind: 'fatherInLaw', named: 'from' },
];

const BOUNDARY = /^(?:$|[.,;:)\]—–\-]|\s+ו)/;

function aliasesOf(r: RelRabbi): string[] {
  const out = new Set<string>();
  for (const raw of [r.name, r.fullName ?? '']) {
    const s = foldQuotes(raw.trim());
    if (!s) continue;
    out.add(s);
    out.add(s.replace(/\s*\([^)]*\)\s*/g, ' ').trim());
    out.add(s.replace(/ הקדוש$/, ''));
    out.add(s.replace(/^ה?אדמו"ר /, ''));
  }
  return Array.from(out).filter(a => a.length >= 3);
}

/** alias → rabbi id, keeping only aliases that name exactly one rabbi. */
export function buildAliasIndex(rabbis: RelRabbi[]): Map<string, string> {
  const owners = new Map<string, Set<string>>();
  rabbis.forEach(r => aliasesOf(r).forEach(a => {
    if (!owners.has(a)) owners.set(a, new Set());
    owners.get(a)!.add(r.id);
  }));
  const index = new Map<string, string>();
  owners.forEach((ids, alias) => { if (ids.size === 1) index.set(alias, Array.from(ids)[0]); });
  return index;
}

/** Names starting at `text`, joined by "ו" / ", " — each must be exact and bounded. */
function readNames(text: string, aliases: string[], index: Map<string, string>): string[] {
  const found: string[] = [];
  let rest = text;
  for (;;) {
    const alias = aliases.find(a => rest.startsWith(a) && BOUNDARY.test(rest.slice(a.length)));
    if (!alias) break;
    found.push(index.get(alias)!);
    const after = rest.slice(alias.length);
    const next = after.match(/^(?:,\s*|\s+ו(?:של )?)/);
    if (!next) break;
    rest = after.slice(next[0].length);
  }
  return found;
}

export function parseRelations(rabbis: RelRabbi[]): Relation[] {
  const index = buildAliasIndex(rabbis);
  // Longest first so "רבי יהודה הנשיא" wins over any shorter prefix alias.
  const aliases = Array.from(index.keys()).sort((a, b) => b.length - a.length);
  const seen = new Set<string>();
  const out: Relation[] = [];
  for (const r of rabbis) {
    const bio = foldQuotes(r.bio);
    for (const { re, kind, named } of PHRASES) {
      re.lastIndex = 0;
      for (let m = re.exec(bio); m; m = re.exec(bio)) {
        for (const other of readNames(bio.slice(m.index + m[0].length), aliases, index)) {
          if (other === r.id) continue;
          const rel: Relation = named === 'from' ? { kind, from: other, to: r.id } : { kind, from: r.id, to: other };
          const key = `${rel.kind}|${rel.from}|${rel.to}`;
          if (!seen.has(key)) { seen.add(key); out.push(rel); }
        }
      }
    }
  }
  return out;
}
