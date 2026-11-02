/**
 * Links a grave to the site's own rabbi directory (pure, tested). Names are
 * compared as word sets without titles, so "הנביא חבקוק" = "חבקוק הנביא" and
 * "קבר הבאבא סאלי" = "באבא סאלי". An ambiguous name links to nobody.
 */
const TITLES = new Set(['רבי', 'רבן', 'הרב', 'רב', "ר'", 'רבינו', 'הנביא', 'הצדיק', 'מרן', 'הגאון', 'זצ"ל', 'ז"ל', 'זיע"א']);

export function nameKey(name: string): string {
  const words = name
    .replace(/[֑-ׇ]/g, '')
    .replace(/״/g, '"').replace(/׳/g, "'")
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[,.–—-]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !TITLES.has(w))
    .map(w => (w === 'הבאבא' ? 'באבא' : w));
  return Array.from(new Set(words)).sort().join(' ');
}

export interface RabbiLike { name: string; fullName: string | null }

export function matchRabbi<R extends RabbiLike>(person: string | null, rabbis: R[]): R | null {
  if (!person) return null;
  const key = nameKey(person);
  if (!key) return null;
  const hits = rabbis.filter(r => nameKey(r.name) === key || (r.fullName ? nameKey(r.fullName) === key : false));
  return hits.length === 1 ? hits[0] : null;
}
