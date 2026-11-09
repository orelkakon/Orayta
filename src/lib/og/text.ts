/**
 * Hebrew text for share-preview images (pure, tested). Satori lays every
 * line out left-to-right, so each line is reordered visually here: runs of
 * Hebrew are reversed (with mirrored brackets) while numbers and Latin keep
 * their own order. Wrapping happens before reordering — reversing a whole
 * paragraph would put its last line first.
 */
const HEBREW = /[א-ת]/;
const LTR_CHAR = /[0-9A-Za-z]/;
const LTR_RUN = /[0-9A-Za-z][0-9A-Za-z.,:/%+\-]*[0-9A-Za-z%]|[0-9A-Za-z]/g;
const MIRROR: Record<string, string> = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '«': '»', '»': '«' };
// Nikud and cantillation marks would land before their letter once reversed.
const MARKS = /[֑-ֽֿ-ׂׄ-ׇ]/g;

/** Strips nikud / teamim and collapses whitespace. */
export function cleanText(s: string): string {
  return s.replace(MARKS, '').replace(/[‎‏‪-‮⁦-⁩]/g, '').replace(/\s+/g, ' ').trim();
}

const flip = (s: string) => Array.from(s).reverse().map(c => MIRROR[c] ?? c).join('');

/** One Hebrew word reversed, keeping any number / Latin run inside it in order. */
function flipWord(word: string): string {
  const parts: string[] = [];
  let last = 0;
  for (const m of Array.from(word.matchAll(LTR_RUN))) {
    if (m.index! > last) parts.push(flip(word.slice(last, m.index)));
    parts.push(m[0]);
    last = m.index! + m[0].length;
  }
  if (last < word.length) parts.push(flip(word.slice(last)));
  return parts.reverse().join('');
}

const isLtrWord = (w: string) => !HEBREW.test(w) && LTR_CHAR.test(w);

/** Visual (left-to-right) order of one RTL line. */
export function visualLine(line: string): string {
  const words = line.split(' ').filter(Boolean);
  const runs: { ltr: boolean; words: string[] }[] = [];
  for (const w of words) {
    const ltr = isLtrWord(w);
    const prev = runs[runs.length - 1];
    if (prev && prev.ltr === ltr) prev.words.push(w);
    else runs.push({ ltr, words: [w] });
  }
  return runs.reverse()
    .map(r => (r.ltr ? r.words.join(' ') : r.words.slice().reverse().map(flipWord).join(' ')))
    .join(' ');
}

/**
 * Greedy word wrap to `maxChars` per line, at most `maxLines` lines; the last
 * line ends with "…" when text was cut. Returns logical (unreversed) lines.
 */
export function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = cleanText(text).split(' ').filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  let i = 0;
  for (; i < words.length; i++) {
    const w = words[i].length > maxChars ? `${words[i].slice(0, maxChars - 1)}…` : words[i];
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars) { cur = next; continue; }
    lines.push(cur);
    cur = w;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && cur) { lines.push(cur); cur = ''; i = words.length; }
  if (i < words.length || cur) {
    const lastLine = lines[lines.length - 1] ?? '';
    const room = maxChars - 1;
    const cut = lastLine.length > room ? lastLine.slice(0, lastLine.lastIndexOf(' ', room) > 0 ? lastLine.lastIndexOf(' ', room) : room) : lastLine;
    lines[lines.length - 1] = `${cut.replace(/[\s,.;:–—-]+$/, '')}…`;
  }
  return lines;
}

/** Wrapped and reordered, ready to render one <div> per line. */
export const rtlLines = (text: string, maxChars: number, maxLines: number) =>
  wrapLines(text, maxChars, maxLines).map(visualLine);

/** A single reordered line (titles, labels), clipped to `maxChars`. */
export const rtl = (text: string, maxChars = 200) => visualLine(wrapLines(text, maxChars, 1)[0] ?? '');
