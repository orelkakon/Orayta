'use client';

import { CSSProperties } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { CityTimes } from '@/lib/shabbat';
import { clock } from '@/lib/shabbatClip/data';
import { FLAME, flicker } from '../Flame';

/**
 * A little luach on the night card: Shabbat's entry and end for the hero's
 * cities, in a gilded frame. Rows are marked by a tiny flame (entry) and the
 * three stars of צאת הכוכבים (end). Once Shabbat is in, the entry row dims.
 */
const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;
const sweep = keyframes`from { transform: translateX(-120%); } to { transform: translateX(120%); }`;
// No blur here: Safari can drop background-clip:text glyphs under an animated filter.
const settle = keyframes`from { opacity: 0; transform: translateY(40%); } to { opacity: 1; transform: none; }`;

const Panel = styled.div`
  position: relative; overflow: hidden; isolation: isolate;
  margin-top: ${theme.spacing.md}; border-radius: ${theme.radii.lg};
  background:
    radial-gradient(120% 140% at 100% 0%, ${theme.gilded.nightTag}, transparent 60%),
    linear-gradient(180deg, ${theme.game.glassHi}, ${theme.game.glass});
  animation: ${rise} 0.55s ${theme.motion.outStrong} 0.6s both;
  /* A gilded hairline: gold at the corners, fading along the sides. */
  &::before {
    content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
    background: linear-gradient(135deg, ${theme.game.goldLight}, ${theme.gilded.nightLine} 30%, transparent 50%, ${theme.gilded.nightLine} 70%, ${theme.game.gold});
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  /* One pass of light across the panel as it arrives. */
  &::after {
    content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background: linear-gradient(100deg, transparent 35%, ${theme.game.goldGlow} 50%, transparent 65%);
    transform: translateX(-120%);
    animation: ${sweep} 1.5s ${theme.motion.inOut} 1.1s both;
  }
  @media (prefers-reduced-motion: reduce) { &::after { display: none; } }
`;

const Grid = styled.div`
  display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr);
  padding: ${theme.spacing.xs} ${theme.spacing.ms};
`;

const Cell = styled.div<{ $sep?: boolean; $rule?: boolean }>`
  display: flex; align-items: center; justify-content: center; min-width: 0;
  padding: ${theme.spacing.sm} ${theme.spacing.xs};
  ${p => p.$sep && `border-inline-start: 1px solid ${theme.gilded.nightLine};`}
  ${p => p.$rule && `border-top: 1px solid ${theme.gilded.nightLine};`}
`;

const City = styled.span`
  font-size: ${theme.fontSizes.xs}; font-weight: 800; letter-spacing: 0.06em;
  color: ${theme.game.gold}; white-space: nowrap;
`;

const RowLabel = styled(Cell)`
  justify-content: flex-start; gap: 7px; padding-inline-end: ${theme.spacing.ms};
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.gilded.nightMuted};
`;

const Time = styled.span<{ $dim: boolean }>`
  font-family: ${theme.fonts.body}; font-weight: 700; line-height: 1;
  font-size: clamp(1.45rem, 1.2rem + 1.2vw, 1.8rem); font-variant-numeric: tabular-nums;
  background: linear-gradient(180deg, ${theme.game.goldInk} 15%, ${theme.game.goldLight} 60%, ${theme.game.gold});
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  opacity: ${p => (p.$dim ? 0.42 : 1)};
  animation: ${settle} 0.6s ${theme.motion.outStrong} calc(0.9s + var(--i) * 90ms) both;
`;

const MiniFlame = styled.i.attrs({ className: 'anim-loop' })`
  width: 8px; height: 14px; flex-shrink: 0;
  border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: ${FLAME}; transform-origin: 50% 100%;
  filter: drop-shadow(0 0 4px ${theme.game.goldGlow});
  animation: ${flicker} 1.4s ease-in-out infinite;
`;

/** The three stars that end Shabbat. */
function Stars() {
  const star = (x: number, y: number, r: number) =>
    `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={`${star(4, 9, 3.6)}${star(13, 5, 4.4)}${star(10.5, 12, 2)}`} fill={theme.game.goldLight} />
    </svg>
  );
}

export default function CityTable({ cities, lit }: { cities: CityTimes[]; lit: boolean }) {
  const rows = [
    { key: 'in', label: HE.SHABBAT_IN, icon: <MiniFlame />, at: (c: CityTimes) => c.candles, dim: lit },
    { key: 'out', label: HE.SHABBAT_OUT, icon: <Stars />, at: (c: CityTimes) => c.ends, dim: false },
  ];
  return (
    <Panel role="group" aria-label={HE.SHABBAT_TIMES_ARIA}>
      <Grid role="table">
        <div role="row" style={{ display: 'contents' }}>
          <Cell role="columnheader" />
          {cities.map((c, i) => (
            <Cell key={c.id} role="columnheader" $sep={i > 0}><City>{HE.SHABBAT_CITY[c.id]}</City></Cell>
          ))}
        </div>
        {rows.map((r, ri) => (
          <div key={r.key} role="row" style={{ display: 'contents' }}>
            <RowLabel role="rowheader" $rule>{r.icon}{r.label}</RowLabel>
            {cities.map((c, i) => (
              <Cell key={c.id} role="cell" $sep={i > 0} $rule>
                <Time $dim={r.dim} style={{ '--i': ri * cities.length + i } as CSSProperties}>{clock(r.at(c))}</Time>
              </Cell>
            ))}
          </div>
        ))}
      </Grid>
    </Panel>
  );
}
