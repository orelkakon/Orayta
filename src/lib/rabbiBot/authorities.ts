import { fetchText, searchExactTexts, SefariaText } from './sefaria';
import { keywords } from './text';
import { overlap } from './match';

// Server-side lookups for poskim whose own books are in no open library the bot
// reads: Sefaria doesn't carry them, and Wikisource removed the Chazon Ish over
// a copyright doubt. Their views reach the bot through halacha books that quote
// them by name (mostly Peninei Halakhah's footnotes).

interface Authority {
  /** Finds him in a question (after gershayim are normalized to "). */
  detect: RegExp;
  /** How the quoting books write his name — Sefaria's exact search matches whole words. */
  names: string[];
}

const AUTHORITIES: Authority[] = [
  { detect: /חזון\s+איש|חזו"א/, names: ['חזון איש', 'החזון איש', 'חזו"א', 'החזו"א'] },
  { detect: /חיים\s+נאה|"ח\s+נאה|קצות\s+השו?לחן/, names: ['חיים נאה', 'ר"ח נאה', 'הגר"ח נאה', 'קצות השלחן'] },
];

const HITS_PER_NAME = 40;
const KEEP_PER_AUTHORITY = 3;

/** The authorities a question names. Pure — unit-tested. */
export function namedAuthorities(question: string): Authority[] {
  const text = question.replace(/[״”“]/g, '"');
  return AUTHORITIES.filter(a => a.detect.test(text));
}

/**
 * Passages that quote a named authority on the question's subject: every
 * Halakhah segment naming him that uses the subject's own term (`terms`, or
 * else the plan's words), ranked by the term first, best few fetched. His name
 * itself never counts as a match.
 */
export async function quotedAuthorities(question: string, terms: string[], words: string[]): Promise<SefariaText[]> {
  const found = namedAuthorities(question);
  if (found.length === 0) return [];
  const per = await Promise.all(found.map(async a => {
    const own = new Set(keywords(a.names.join(' ')));
    const key = terms.filter(w => !own.has(w));
    const rest = words.filter(w => !own.has(w));
    const must = key.length > 0 ? key : rest;
    const hits = (await Promise.all(a.names.map(n => searchExactTexts(n, 'Halakhah', HITS_PER_NAME)))).flat();
    const seen = new Set<string>();
    const ranked = hits.filter(h => !seen.has(h.ref) && seen.add(h.ref))
      .filter(h => overlap(h.text, must) > 0)
      .map(h => ({ ref: h.ref, score: overlap(h.text, key) * 10 + overlap(h.text, rest) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, KEEP_PER_AUTHORITY);
    return Promise.all(ranked.map(h => fetchText(h.ref)));
  }));
  return per.flat().filter((t): t is SefariaText => t !== null);
}
