import { prisma } from '@/lib/db';
import { overlap } from './text';

// Server-only: the site's own book summaries (SikumEntry) as a source. They
// are written and reviewed by the site's editor, so they count as reliable
// supporting material; each one deep-links to its entry on /sikumim.

export interface SikumHit {
  id: string;
  heRef: string;
  book: string;
  text: string;
  url: string;
}

const MAX_TERMS = 6;
const SCAN = 40;

/** Best-matching summaries for the question's keywords (needs ≥ 2 shared words). */
export async function searchSikumim(words: string[], limit: number): Promise<SikumHit[]> {
  const terms = [...words].sort((a, b) => b.length - a.length).slice(0, MAX_TERMS);
  if (terms.length === 0) return [];
  const rows = await prisma.sikumEntry.findMany({
    where: { OR: terms.flatMap(t => [{ text: { contains: t } }, { title: { contains: t } }]) },
    select: { id: true, bookId: true, title: true, text: true, location: true, book: { select: { name: true, author: true } } },
    take: SCAN,
  }).catch(() => []);

  return rows
    .map(r => ({ r, score: overlap(`${r.title ?? ''} ${r.text}`, words) }))
    .filter(x => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ r }) => {
      const author = r.book.author ? ` (${r.book.author})` : '';
      const where = [r.title, r.location].filter(Boolean).join(', ');
      return {
        id: r.id,
        heRef: `${r.book.name}${author}${where ? ` — ${where}` : ''}`,
        book: r.book.name,
        text: `${r.title ? `${r.title}: ` : ''}${r.text}`.replace(/\s+/g, ' '),
        url: `/sikumim?book=${r.bookId}&entry=${r.id}`,
      };
    });
}
