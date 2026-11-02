/* Server-only: graves near a point, linked to the rabbi directory. */
import { prisma } from '@/lib/db';
import { haversineM } from '@/lib/minyan/geo';
import entries from './data/kivrei.json';
import meta from '@/lib/minyan/data/osm-meta.json';
import { matchRabbi } from './rabbiMatch';
import type { Kever, KeverEntry } from './types';

const KIVREI = entries as unknown as KeverEntry[];
export const KIVREI_DATASET_DATE = new Date(`${meta.date}T00:00:00Z`).toISOString();

interface RabbiRow { name: string; fullName: string | null; deathDate: string | null; datePeriod: string; bio: string }

let rabbiCache: { at: number; rows: RabbiRow[] } | null = null;

/** The directory changes rarely — one query per instance per hour; a DB hiccup just means no links. */
async function rabbis(): Promise<RabbiRow[]> {
  if (rabbiCache && Date.now() - rabbiCache.at < 60 * 60 * 1000) return rabbiCache.rows;
  try {
    const rows = await prisma.rabbi.findMany({ select: { name: true, fullName: true, deathDate: true, datePeriod: true, bio: true } });
    rabbiCache = { at: Date.now(), rows };
    return rows;
  } catch {
    return rabbiCache?.rows ?? [];
  }
}

/** First sentence(s) of a directory bio, as a fallback "who was he". */
function shortBio(bio: string): string | null {
  const t = bio.replace(/\s+/g, ' ').trim();
  if (t.length < 20) return null;
  if (t.length <= 260) return t;
  const end = t.slice(0, 260).lastIndexOf('.');
  return end > 80 ? t.slice(0, end + 1) : `${t.slice(0, 260).trimEnd()}…`;
}

export async function kivreiNear(lat: number, lng: number, radiusM: number): Promise<Kever[]> {
  const near = KIVREI
    .map(e => ({ e, d: Math.round(haversineM(lat, lng, e.lat, e.lng)) }))
    .filter(x => x.d <= radiusM)
    .sort((a, b) => a.d - b.d);
  const dir = near.length ? await rabbis() : [];
  return near.map(({ e, d }) => {
    const r = matchRabbi(e.person, dir);
    const fromDir = !e.about && r ? shortBio(r.bio) : null;
    return {
      id: e.id, name: e.name, person: e.person, lat: e.lat, lng: e.lng,
      personUrl: e.personUrl, siteUrl: e.siteUrl, image: e.image,
      hours: e.hours, note: e.note, wheelchair: e.wheelchair, osmUrl: e.osmUrl,
      about: e.about ?? fromDir,
      aboutFrom: e.aboutFrom ?? (fromDir ? 'directory' : null),
      distanceM: d,
      rabbi: r ? { name: r.name, deathDate: r.deathDate, datePeriod: r.datePeriod } : null,
    };
  });
}
