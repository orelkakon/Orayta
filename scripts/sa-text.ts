/**
 * Builds src/lib/rabbiBot/data/sa-text.json: the whole Shulchan Arukh (the
 * four parts, Maran + the Rema's glosses) as plain text, one string per seif —
 * the same versions and the same cleaning as fetchText (sefaria.ts), so a
 * quote verified against it is verified against what Sefaria shows.
 * רבי־בוט searches it locally (saIndex.ts) to find the siman a question sits
 * in, and serves Shulchan Arukh passages from it without a request. Also
 * each part's hilchot (the section a siman belongs to). Eight requests.
 * Rerun only if Sefaria's text changes.
 *
 *   npx tsx scripts/sa-text.ts
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { stripHtml, markRema } from '../src/lib/rabbiBot/text';

const OUT = join(__dirname, '..', 'src', 'lib', 'rabbiBot', 'data', 'sa-text.json');
/** Sefaria's default Hebrew version of each part (what /api/texts returns). */
const VERSIONS: Record<string, string> = {
  'Orach Chayim': 'Maginei Eretz: Shulchan Aruch Orach Chaim, Lemberg, 1893',
  "Yoreh De'ah": 'Ashlei Ravrevei: Shulchan Aruch Yoreh Deah, Lemberg, 1888',
  'Even HaEzer': 'Apei Ravrevei: Shulchan Aruch Even HaEzer, Lemberg, 1886',
  'Choshen Mishpat': 'Shulhan Arukh, Hoshen ha-Mishpat, Lemberg, 1898',
};

type Node = string[][] | Record<string, string[][]>;

/** A part's hilchot ("הלכות ציצית" = simanim 8–24), from Sefaria's "Topic" structure. */
export interface SaSection { name: string; from: number; to: number }
interface AltNode { titles?: { lang: string; text: string }[]; wholeRef?: string }

async function sections(part: string): Promise<SaSection[]> {
  const res = await fetch(`https://www.sefaria.org/api/v2/raw/index/${encodeURIComponent(`Shulchan Arukh, ${part}`.replace(/ /g, '_'))}`);
  if (!res.ok) throw new Error(`${part} index: HTTP ${res.status}`);
  const nodes = (await res.json() as { alt_structs?: { Topic?: { nodes?: AltNode[] } } }).alt_structs?.Topic?.nodes ?? [];
  return nodes.flatMap(n => {
    const name = n.titles?.find(t => t.lang === 'he')?.text;
    const m = n.wholeRef?.match(/ (\d+)(?::\d+)?(?:-(\d+))?(?::\d+)?$/);
    // "…297:1-40" is one siman's seifim, not simanim 297–40.
    return name && m ? [{ name, from: Number(m[1]), to: Math.max(Number(m[1]), Number(m[2] ?? m[1])) }] : [];
  });
}

async function download(part: string): Promise<string[][]> {
  const url = `https://www.sefaria.org/download/version/${encodeURIComponent(`Shulchan Arukh, ${part} - he - ${VERSIONS[part]}`)}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${part}: HTTP ${res.status}`);
  const text = (await res.json() as { text: Node }).text;
  // Even HaEzer is a complex text: its simanim are the default ("") node, beside Seder HaGet / Halitzah.
  const simanim = Array.isArray(text) ? text : text[''];
  return simanim.map(seifim => (seifim ?? []).map(html => stripHtml(markRema(html ?? ''))));
}

(async () => {
  const text: Record<string, string[][]> = {};
  const hilchot: Record<string, SaSection[]> = {};
  for (const part of Object.keys(VERSIONS)) {
    text[part] = await download(part);
    hilchot[part] = await sections(part);
    const seifim = text[part].reduce((n, s) => n + s.length, 0);
    console.log(`${part}: ${text[part].length} simanim, ${seifim} seifim, ${hilchot[part].length} hilchot`);
    await new Promise(r => setTimeout(r, 1500));
  }
  writeFileSync(OUT, `${JSON.stringify({ text, hilchot })}\n`);
})();
