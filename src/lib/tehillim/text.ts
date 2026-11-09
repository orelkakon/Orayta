/**
 * Sefaria's Tehillim verse → booklet text (pure, tested): cantillation marks
 * dropped (vowels kept), the paseq stroke and the {פ}/{ס} section marks
 * removed (and trailing line breaks), and ketiv / qere read as written in every siddur — the unvoweled
 * ketiv in (…) dropped, the voweled qere in […] kept without its brackets.
 */
const TEAMIM = /[֑-֯]/g;
const VOWELS = /[ְ-ׇ]/;

export function bookletVerse(html: string): string {
  return html
    .replace(TEAMIM, '')
    .replace(/\s*׀\s*/g, ' ')
    .replace(/\s*\{[פס]\}\s*/g, ' ')
    .replace(/\s*\(([^()<>]*)\)/g, (m, inner: string) => (VOWELS.test(inner) ? m : ''))
    .replace(/\[([^\][<>]*)\]/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/(&nbsp;|\s|<br\s*\/?>)+$/, '')
    .trim();
}
