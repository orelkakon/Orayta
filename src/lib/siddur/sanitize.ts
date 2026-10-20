// Sefaria's siddur text is HTML. We proxy it into our pages, so only the
// handful of presentational tags it actually uses survive — with no
// attributes — and everything else is reduced to its text.
const ALLOWED = new Set(['b', 'big', 'small', 'br', 'strong', 'i', 'em', 'sup', 'sub']);

export function sanitizeSiddurHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object)[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (_m, slash: string, tag: string) => {
      const t = tag.toLowerCase();
      if (!ALLOWED.has(t)) return '';
      return t === 'br' ? '<br>' : `<${slash}${t}>`;
    })
    .replace(/<(?![a-z/])/gi, '&lt;')
    .trim();
}
