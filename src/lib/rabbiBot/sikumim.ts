import { prisma } from '@/lib/db';
import { overlap } from './match';

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
/** A word in the entry's title counts this much more than one in its body (the title names the subject). */
const TITLE_WEIGHT = 2;

/**
 * Best-matching summaries for the question's keywords: ≥ 2 shared words, at
 * least one of them from `core` (the plan's source-language words), so the
 * user's everyday wording alone never pulls in an unrelated summary. Title
 * words weigh more — sibling entries of one chapter ("הלכות חנוכה - …") share
 * the body's vocabulary, and the title says which of them is about the question.
 */
export async function searchSikumim(words: string[], limit: number, core: string[] = words): Promise<SikumHit[]> {
  const terms = [...words].sort((a, b) => b.length - a.length).slice(0, MAX_TERMS);
  if (terms.length === 0) return [];
  const rows = await prisma.sikumEntry.findMany({
    where: { OR: terms.flatMap(t => [{ text: { contains: t } }, { title: { contains: t } }]) },
    select: { id: true, bookId: true, title: true, text: true, location: true, book: { select: { name: true, author: true } } },
    take: SCAN,
  }).catch(() => []);

  return rows
    .map(r => {
      const text = `${r.title ?? ''} ${r.text}`;
      const body = overlap(text, words);
      return { r, body, score: body + TITLE_WEIGHT * overlap(r.title ?? '', words), anchored: core.length === 0 || overlap(text, core) > 0 };
    })
    .filter(x => x.body >= 2 && x.anchored)
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
