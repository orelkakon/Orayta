/**
 * Site fonts for share-preview images, fetched from Google Fonts subset to the
 * exact characters drawn (a few KB each). Google serves TrueType to a client
 * without a browser user agent, which is what Satori needs. A font that fails
 * to load is left out — the image still renders with the fallback.
 */
export interface OgFont { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: 'normal'; }

const FAMILIES = {
  frank: 'Frank Ruhl Libre',
  heebo: 'Heebo',
} as const;

export type OgFamily = keyof typeof FAMILIES;

async function loadFont(family: OgFamily, weight: OgFont['weight'], text: string): Promise<OgFont | null> {
  const name = FAMILIES[family];
  const chars = Array.from(new Set(Array.from(text))).join('');
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@${weight}&text=${encodeURIComponent(chars)}`;
  try {
    const css = await fetch(url, { cache: 'force-cache' }).then(r => (r.ok ? r.text() : ''));
    const src = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!src) return null;
    const data = await fetch(src, { cache: 'force-cache' }).then(r => (r.ok ? r.arrayBuffer() : null));
    return data ? { name, data, weight, style: 'normal' } : null;
  } catch {
    return null;
  }
}

/** Loads each (family, weight) the card uses, subset to the given text. */
export async function loadOgFonts(uses: { family: OgFamily; weight: OgFont['weight']; text: string }[]): Promise<OgFont[]> {
  const fonts = await Promise.all(uses.filter(u => u.text).map(u => loadFont(u.family, u.weight, u.text)));
  return fonts.filter((f): f is OgFont => f !== null);
}

export const fontName = (family: OgFamily) => FAMILIES[family];
