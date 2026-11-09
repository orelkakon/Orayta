import type { OgSpec } from '@/types/og';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { OgIcon } from './icons';
import { rtl, rtlLines } from './text';
import { fontName } from './fonts';
import { SITE_URL } from '@/lib/siteUrl';

const DOMAIN = new URL(SITE_URL).host;

/**
 * The share-preview card (1200×630) — one visual system for every page:
 * a gilded frame on espresso night (or parchment for quoted text), the
 * section as a gold eyebrow, a big Frank Ruhl title and an emblem.
 * Sizes are tuned for WhatsApp, which shows it ~400px wide.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const INK = {
  night: { bg: theme.gilded.night, title: '#F6ECDC', text: '#D9C7AE', muted: '#A88F72', frame: 'rgba(233,194,122,0.45)' },
  parchment: { bg: 'linear-gradient(160deg, #FBF7F0 0%, #F1E7D6 100%)', title: '#2C1810', text: '#4A3423', muted: '#8A7058', frame: 'rgba(160,112,52,0.45)' },
} as const;
const GOLD = '#E1B66C';
const GOLD_DEEP = '#B07D35';

const frank = fontName('frank');
const heebo = fontName('heebo');

/** Title lines per layout: shorter titles get a bigger size. */
function titleFit(title: string, quote: boolean) {
  if (quote) return { size: 46, lines: rtlLines(title, 36, 1) };
  return title.length <= 14 ? { size: 92, lines: rtlLines(title, 14, 1) } : { size: 68, lines: rtlLines(title, 19, 2) };
}

/** Quote size by length: a short saying fills the card, a long passage still fits four lines above the footer. */
function quoteFit(quote: string) {
  if (quote.length <= 70) return { size: 54, chars: 32, lines: 3 };
  if (quote.length <= 150) return { size: 46, chars: 38, lines: 4 };
  return { size: 38, chars: 48, lines: 4 };
}

function Emblem({ spec, tone }: { spec: OgSpec; tone: keyof typeof INK }) {
  const ring = tone === 'night' ? GOLD : GOLD_DEEP;
  const center = { display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;
  // Two thin rings instead of a glow: a blurred shadow doubles the PNG size (WhatsApp drops previews over ~300 KB).
  return (
    <div style={{ ...center, width: 324, height: 324, borderRadius: 162, border: `1px solid ${ring}` }}>
      <div style={{
        ...center, width: 300, height: 300, borderRadius: 150, overflow: 'hidden',
        border: `3px solid ${ring}`, background: tone === 'night' ? 'rgba(225,182,108,0.10)' : 'rgba(176,125,53,0.08)',
      }}>
        {spec.image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={spec.image} width={294} height={294} style={{ objectFit: 'cover', borderRadius: 147 }} alt="" />
          : spec.badge
            ? <div style={{ display: 'flex', fontFamily: heebo, fontSize: 64, fontWeight: 500, color: ring, letterSpacing: 6 }}>{spec.badge}</div>
            : <OgIcon name={spec.icon ?? 'openbook'} size={150} color={ring} />}
      </div>
    </div>
  );
}

export function OgCard({ spec }: { spec: OgSpec }) {
  const ink = INK[spec.tone];
  const quote = !!spec.quote;
  const t = titleFit(spec.title, quote);
  const q = spec.quote ? quoteFit(spec.quote) : null;
  const accent = spec.tone === 'night' ? GOLD : GOLD_DEEP;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: ink.bg, padding: 22 }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', borderRadius: 30,
        border: `2px solid ${ink.frame}`, padding: quote ? '44px 64px' : '40px 64px 40px 48px', position: 'relative',
      }}>
        {!quote && <Emblem spec={spec} tone={spec.tone} />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 18, marginLeft: quote ? 0 : 48 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '6px 20px', borderRadius: 999,
            border: `1.5px solid ${accent}`, color: accent, fontFamily: heebo, fontWeight: 500, fontSize: 24,
          }}>
            {rtl(spec.eyebrow, 40)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {t.lines.map(l => (
              <div key={l} style={{ display: 'flex', fontFamily: frank, fontWeight: 700, fontSize: t.size, lineHeight: 1.12, color: ink.title }}>{l}</div>
            ))}
          </div>
          {quote && <div style={{ width: 84, height: 3, borderRadius: 2, background: accent }} />}
          {q && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {rtlLines(spec.quote ?? '', q.chars, q.lines).map(l => (
                <div key={l} style={{ display: 'flex', fontFamily: frank, fontWeight: 500, fontSize: q.size, lineHeight: 1.4, color: ink.text }}>{l}</div>
              ))}
            </div>
          )}
          {spec.subtitle && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {rtlLines(spec.subtitle, quote ? 60 : 40, 2).map(l => (
                <div key={l} style={{ display: 'flex', fontFamily: heebo, fontWeight: 400, fontSize: quote ? 26 : 31, lineHeight: 1.45, color: quote ? ink.muted : ink.text }}>{l}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{
          position: 'absolute', bottom: 22, left: 40, right: 40, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', fontFamily: heebo, fontWeight: 500, fontSize: 22, color: ink.muted,
        }}>
          <div style={{ display: 'flex' }}>{DOMAIN}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>{rtl(HE.OG_TAGLINE)}</div>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: accent }} />
            <div style={{ display: 'flex', fontFamily: frank, fontWeight: 700, fontSize: 30, color: accent }}>{rtl(HE.APP_NAME)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Every string the card draws, per font, so the font subsets cover them. */
export function cardTexts(spec: OgSpec) {
  return {
    frank700: `${spec.title}${HE.APP_NAME}`,
    frank500: spec.quote ? `${spec.quote}…` : '',
    heebo500: `${spec.eyebrow}${DOMAIN}${HE.OG_TAGLINE}${spec.badge ?? ''}…`,
    heebo400: `${spec.subtitle ?? ''}…`,
  };
}
