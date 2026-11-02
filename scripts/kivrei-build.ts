/**
 * Builds src/lib/kivrei/data/kivrei.json — graves of tzadikim for
 * "קברי צדיקים באזור". Run after scripts/osm-snapshot.py:
 *
 *   npx tsx scripts/kivrei-build.ts
 *
 * Sources:
 *  - Hebrew Wikipedia, category tree "קברי צדיקים" (curated): grave pages
 *    with coordinates → position, intro text, photo, link.
 *  - OpenStreetMap tombs (src/lib/minyan/data/osm-tombs.json): matched to a
 *    Wikipedia grave by wikipedia/wikidata tag or proximity; unmatched ones
 *    are kept only when clearly a tzadik's grave (see keepOsm).
 *  - For each grave, the buried person's own Wikipedia page (title without
 *    "קבר"/"ציון"/"מערת") gives the short "who was he" text, when it exists
 *    and isn't a disambiguation page.
 * Texts are Wikipedia's (CC BY-SA) — credited with a link on every card.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { personFromSite, keepOsm, sameSite, cleanExtract, isBlocked } from '../src/lib/kivrei/build';
import type { KeverEntry } from '../src/lib/kivrei/types';

const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'src', 'lib', 'kivrei', 'data', 'kivrei.json');
const UA = 'Orayta/1.0 (+https://orayta-eight.vercel.app)';
const API = 'https://he.wikipedia.org/w/api.php';
const ROOT_CAT = 'קטגוריה:קברי צדיקים';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function wiki<T>(params: Record<string, string>): Promise<T> {
  await sleep(150);
  const res = await fetch(`${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`wikipedia HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

interface Member { ns: number; title: string }
async function crawl(cat: string, depth: number, seen: Set<string>, out: Set<string>) {
  if (seen.has(cat) || depth < 0) return;
  seen.add(cat);
  let cont: string | undefined;
  do {
    const r = await wiki<{ query: { categorymembers: Member[] }; continue?: { cmcontinue: string } }>({
      action: 'query', list: 'categorymembers', cmtitle: cat, cmlimit: '500', ...(cont ? { cmcontinue: cont } : {}),
    });
    for (const m of r.query.categorymembers) {
      if (m.ns === 14) await crawl(m.title, depth - 1, seen, out);
      else if (m.ns === 0) out.add(m.title);
    }
    cont = r.continue?.cmcontinue;
  } while (cont);
}

interface Page {
  pageid?: number; title: string; missing?: boolean; extract?: string;
  coordinates?: { lat: number; lon: number }[];
  thumbnail?: { source: string };
  pageprops?: { wikibase_item?: string; disambiguation?: string };
}
async function pages(titles: string[]): Promise<Map<string, Page>> {
  const out = new Map<string, Page>();
  for (let i = 0; i < titles.length; i += 20) {
    const batch = titles.slice(i, i + 20);
    const r = await wiki<{ query: { pages: Page[]; redirects?: { from: string; to: string }[]; normalized?: { from: string; to: string }[] } }>({
      action: 'query', titles: batch.join('|'), redirects: '1',
      prop: 'coordinates|extracts|pageimages|pageprops', exintro: '1', explaintext: '1', exsentences: '3',
      exlimit: 'max', piprop: 'thumbnail', pithumbsize: '480', colimit: 'max',
    });
    const alias = new Map<string, string>();
    [...(r.query.normalized ?? []), ...(r.query.redirects ?? [])].forEach(x => alias.set(x.from, x.to));
    const byTitle = new Map(r.query.pages.map(p => [p.title, p]));
    for (const t of batch) {
      let cur = t;
      for (let k = 0; k < 3 && alias.has(cur); k++) cur = alias.get(cur)!;
      const p = byTitle.get(cur);
      if (p && !p.missing) out.set(t, p);
    }
  }
  return out;
}

/* Wikidata classes that mean "a person": human, biblical figure, (semi-)legendary person. */
const PERSON_CLASSES = new Set(['Q5', 'Q20643955', 'Q15632617', 'Q3658341', 'Q20002503']);

/** QIDs whose instance-of (P31) is a person class. */
async function humanItems(qids: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  for (let i = 0; i < qids.length; i += 50) {
    await sleep(150);
    const qs = new URLSearchParams({ action: 'wbgetentities', ids: qids.slice(i, i + 50).join('|'), props: 'claims', format: 'json' });
    const res = await fetch(`https://www.wikidata.org/w/api.php?${qs}`, { headers: { 'User-Agent': UA } });
    const json = await res.json() as { entities: Record<string, { claims?: { P31?: { mainsnak: { datavalue?: { value: { id: string } } } }[] } }> };
    for (const [qid, ent] of Object.entries(json.entities)) {
      if ((ent.claims?.P31 ?? []).some(c => PERSON_CLASSES.has(c.mainsnak.datavalue?.value.id ?? ''))) out.add(qid);
    }
  }
  return out;
}

const wikiUrl = (title: string) => `https://he.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
type OsmRow = { k: string; la: number; lo: number; ts: string } & Record<string, string | number>;

async function main() {
  const titles = new Set<string>();
  await crawl(ROOT_CAT, 4, new Set(), titles);
  const osm = JSON.parse(readFileSync(join(ROOT, 'src/lib/minyan/data/osm-tombs.json'), 'utf8')) as OsmRow[];
  osm.forEach(o => {
    const w = String(o['wikipedia:he'] ?? o.wikipedia ?? '');
    if (w.startsWith('he:')) titles.add(w.slice(3)); else if (o['wikipedia:he']) titles.add(w);
  });
  console.log('candidate pages', titles.size);

  const site = await pages(Array.from(titles));
  const graves = Array.from(site.values()).filter(p => p.coordinates?.length && personFromSite(p.title) !== null && !isBlocked(p.title));
  const uniq = new Map(graves.map(p => [p.title, p]));
  console.log('grave pages with coordinates', uniq.size);

  const entries: KeverEntry[] = Array.from(uniq.values()).map(p => ({
    id: `wp:${p.pageid}`, name: p.title, person: personFromSite(p.title),
    lat: Number(p.coordinates![0].lat.toFixed(6)), lng: Number(p.coordinates![0].lon.toFixed(6)),
    about: null, aboutFrom: null, personUrl: null,
    siteUrl: wikiUrl(p.title), siteAbout: cleanExtract(p.extract), image: p.thumbnail?.source ?? null,
    wikidata: p.pageprops?.wikibase_item ?? null,
    hours: null, note: null, wheelchair: null, osmUrl: null,
  }));

  // OSM: enrich a matching Wikipedia grave, or add a clearly-tzadik grave.
  for (const o of osm) {
    const name = String(o['name:he'] ?? o.name ?? '').replace(/\s+/g, ' ').trim();
    const wd = o.wikidata ? String(o.wikidata) : null;
    const wpTitle = String(o['wikipedia:he'] ?? o.wikipedia ?? '').replace(/^he:/, '');
    const match = entries.find(e => (wd && e.wikidata === wd) || (wpTitle && e.name === wpTitle) || sameSite(e, { name, lat: o.la, lng: o.lo }));
    const osmInfo = {
      hours: o.opening_hours ? String(o.opening_hours) : null,
      note: o['description:he'] ? String(o['description:he']) : (o.description ? String(o.description) : null),
      wheelchair: o.wheelchair ? String(o.wheelchair) : null,
      osmUrl: `https://www.openstreetmap.org/${o.k}`,
    };
    if (match) {
      if (!match.osmUrl) Object.assign(match, { ...osmInfo, lat: o.la, lng: o.lo, note: match.note ?? osmInfo.note });
    } else if (keepOsm(o) && !entries.some(e => e.id.startsWith('osm:') && sameSite(e, { name, lat: o.la, lng: o.lo }))) {
      entries.push({
        id: `osm:${o.k}`, name, person: personFromSite(name) ?? name, lat: o.la, lng: o.lo,
        about: null, aboutFrom: null, personUrl: null, siteUrl: null, siteAbout: null, image: null,
        wikidata: wd, ...osmInfo,
      });
    }
  }

  // The buried person's own page → "who was he" text + link.
  const persons = Array.from(new Set(entries.map(e => e.person).filter((p): p is string => !!p)));
  const personPages = await pages(persons);
  const humans = await humanItems(Array.from(personPages.values()).map(p => p.pageprops?.wikibase_item).filter((q): q is string => !!q));
  for (const e of entries) {
    const p = e.person ? personPages.get(e.person) : undefined;
    // Only a page about a person: "חולדה" the animal or "אור החיים" the book must not describe a grave.
    if (p && humans.has(p.pageprops?.wikibase_item ?? '') && cleanExtract(p.extract)) {
      e.about = cleanExtract(p.extract);
      e.aboutFrom = 'person';
      e.personUrl = wikiUrl(p.title);
      e.image = e.image ?? p.thumbnail?.source ?? null;
    } else if (e.siteAbout) {
      e.about = e.siteAbout;
      e.aboutFrom = 'site';
    }
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));
  mkdirSync(join(ROOT, 'src/lib/kivrei/data'), { recursive: true });
  writeFileSync(OUT, JSON.stringify(entries));
  console.log(`wrote ${entries.length} graves (${entries.filter(e => e.aboutFrom === 'person').length} with a bio)`);
}

main().catch(err => { console.error(err); process.exit(1); });
