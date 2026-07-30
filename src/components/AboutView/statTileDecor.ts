import { css, keyframes, RuleSet } from 'styled-components';
import { theme } from '@/lib/theme';
import type { TileVariant } from './statTilesConfig';

// Per-category background artwork, drawn in pure CSS from the tile's
// `--tile-tint` / `--tile-ink` custom properties so it follows dark mode
// for free. Everything here is decorative: pseudo-elements only, no
// pointer events, no text the screen reader can reach.

const pseudo = css`
  content: '';
  position: absolute;
  pointer-events: none;
`;

const flicker = keyframes`
  from { opacity: 0.4; transform: scale(0.85); }
  to   { opacity: 0.9; transform: scale(1.2); }
`;

export const TILE_DECOR: Record<TileVariant, RuleSet<object>> = {
  /* hero — concentric target rings rising from the far corner */
  target: css`
    &::before {
      ${pseudo}
      inset-inline-end: -52px; bottom: -52px;
      width: 220px; height: 220px; border-radius: 50%;
      background: repeating-radial-gradient(circle,
        transparent 0 24px,
        color-mix(in srgb, var(--tile-ink) 13%, transparent) 24px 26px);
    }
  `,

  /* citations — one oversized serif gershayim, like a pull-quote */
  quote: css`
    &::after {
      ${pseudo}
      content: '״';
      inset-inline-end: 14px; top: -8px;
      font-family: ${theme.fonts.body};
      font-size: 5rem; font-weight: 700; line-height: 1;
      color: color-mix(in srgb, var(--tile-tint) 36%, transparent);
    }
  `,

  /* rabbis — two overlapping portrait circles */
  portraits: css`
    &::before {
      ${pseudo}
      width: 76px; height: 76px; border-radius: 50%;
      inset-inline-end: -24px; bottom: -30px;
      border: 2px solid color-mix(in srgb, var(--tile-tint) 22%, transparent);
    }
    &::after {
      ${pseudo}
      width: 46px; height: 46px; border-radius: 50%;
      inset-inline-end: 36px; bottom: -16px;
      border: 2px solid color-mix(in srgb, var(--tile-tint) 30%, transparent);
    }
  `,

  /* videos — film-strip perforations along the far edge */
  film: css`
    &::before {
      ${pseudo}
      inset-inline-end: 0; top: 0; bottom: 0; width: 13px;
      background: repeating-linear-gradient(180deg,
        color-mix(in srgb, var(--tile-tint) 24%, transparent) 0 7px,
        transparent 7px 15px);
      border-inline-start: 1px solid color-mix(in srgb, var(--tile-tint) 18%, transparent);
    }
  `,

  /* prayers — a soft golden radiance from the corner */
  glow: css`
    &::before {
      ${pseudo}
      inset: 0;
      background: radial-gradient(circle at 16% 20%,
        color-mix(in srgb, var(--tile-tint) 28%, transparent) 0%,
        transparent 58%);
    }
  `,

  /* books — spines standing on a shelf line */
  shelf: css`
    &::after {
      ${pseudo}
      inset-inline: 10px; bottom: 0; height: 24px;
      opacity: 0.55;
      background: repeating-linear-gradient(90deg,
        color-mix(in srgb, var(--tile-tint) 32%, transparent) 0 5px,
        transparent 5px 8px,
        color-mix(in srgb, var(--tile-tint) 18%, transparent) 8px 14px,
        transparent 14px 17px);
      border-bottom: 2px solid color-mix(in srgb, var(--tile-tint) 36%, transparent);
    }
  `,

  /* gematria — a large watermark aleph */
  aleph: css`
    &::after {
      ${pseudo}
      content: 'א';
      inset-inline-end: 8px; bottom: -16px;
      font-family: ${theme.fonts.body};
      font-size: 4.6rem; font-weight: 700; line-height: 1;
      color: color-mix(in srgb, var(--tile-tint) 18%, transparent);
    }
  `,

  /* summaries — ruled notebook lines fading in from below */
  paper: css`
    &::before {
      ${pseudo}
      inset: 36% 0 0 0;
      opacity: 0.5;
      background: repeating-linear-gradient(180deg,
        transparent 0 13px,
        color-mix(in srgb, var(--tile-tint) 24%, transparent) 13px 14px);
      -webkit-mask-image: linear-gradient(180deg, transparent, #000 35%);
      mask-image: linear-gradient(180deg, transparent, #000 35%);
    }
  `,

  /* chidushim — rays of light from the far top corner */
  rays: css`
    &::before {
      ${pseudo}
      inset: 0;
      background: repeating-conic-gradient(from 150deg at 12% 0%,
        color-mix(in srgb, var(--tile-tint) 10%, transparent) 0deg 8deg,
        transparent 8deg 26deg);
    }
  `,

  /* dedications — warm candle glow with a gently flickering flame */
  candle: css`
    &::before {
      ${pseudo}
      inset: 0;
      background: radial-gradient(circle at 14% 80%,
        color-mix(in srgb, var(--tile-tint) 24%, transparent) 0%,
        transparent 55%);
    }
    &::after {
      ${pseudo}
      width: 9px; height: 9px; border-radius: 50%;
      inset-inline-end: 24px; top: 18px;
      background: ${theme.colors.secondary};
      filter: blur(5px);
      animation: ${flicker} 2.2s ease-in-out infinite alternate;
    }
    @media (prefers-reduced-motion: reduce) {
      &::after { animation: none; opacity: 0.6; }
    }
  `,
};
