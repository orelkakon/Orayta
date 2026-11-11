/**
 * Builds src/lib/rabbiBot/data/sa-toc.json: the title of every siman in the
 * four parts of the Shulchan Arukh ("זמן הדלקת נר חנוכה"), from the bold
 * heading of its first seif on Sefaria. רבי־בוט matches questions against it
 * (lib/rabbiBot/toc.ts) so a siman is found by its subject, not only by a
 * model's memory of its number. Rerun only if Sefaria's text changes.
 *
 *   npx tsx scripts/sa-toc.ts
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { stripHtml, simanTitle } from '../src/lib/rabbiBot/text';

const PARTS = ['Orach Chayim', "Yoreh De'ah", 'Even HaEzer', 'Choshen Mishpat'];
const BASE = 'https://www.sefaria.org';
const CONCURRENCY = 8;
const OUT = join(__dirname, '..', 'src', 'lib', 'rabbiBot', 'data', 'sa-toc.json');

const enc = (ref: string) => encodeURIComponent(ref.replace(/ /g, '_'));

async function json<T>(url: string, tries = 3): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (res.ok) return await res.json() as T;
    } catch { /* retried */ }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

/** "<b>זמן הדלקת נר חנוכה. ובו ב סעיפים:</b>…" → "זמן הדלקת נר חנוכה". */
export function headingOf(html: string): string {
  const bold = html.match(/<b>([\s\S]*?)<\/b>/)?.[1];
  const text = stripHtml(bold ?? html);
  const title = simanTitle(text) || (bold ? text : '');
  return title.replace(/\.?\s*ובו\s+(סעיף אחד|[א-ת"״׳']{1,4}\s+סעיפים).*$/, '').replace(/[.:\s]+$/, '').trim();
}

async function part(name: string): Promise<string[]> {
  const shape = await json<{ length?: number }[]>(`${BASE}/api/shape/${enc(`Shulchan Arukh, ${name}`)}`);
  const count = shape?.[0]?.length ?? 0;
  const titles: string[] = new Array(count).fill('');
  let next = 0;
  const worker = async () => {
    while (next < count) {
      const n = ++next;
      const d = await json<{ he?: unknown }>(`${BASE}/api/texts/${enc(`Shulchan Arukh, ${name} ${n}:1`)}?context=0&commentary=0&lang=he`);
      titles[n - 1] = typeof d?.he === 'string' ? headingOf(d.he) : '';
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`${name}: ${count} simanim, ${titles.filter(Boolean).length} titled`);
  return titles;
}

(async () => {
  const out: Record<string, string[]> = {};
  for (const name of PARTS) out[name] = await part(name);
  writeFileSync(OUT, `${JSON.stringify(out)}\n`);
})();
