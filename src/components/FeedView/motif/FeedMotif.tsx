'use client';

import { CSSProperties, memo } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FeedItemType } from '@/types';
import MotifArt from './MotifArt';
import { MOTIFS_BY_TYPE, hashSeed, rnd } from './motifPaths';

/**
 * A post's living backdrop: two slow aurora lights in its accent colour and
 * one of six authentic motifs (a daf, a mosaic rosette, a Magen David
 * lattice, candle sparks, a ring of letters, a Sefer Torah column), placed,
 * scaled and tilted by the post's own seed — no two posts look alike.
 *
 * `live` = on screen. Off screen every loop is paused, so a long deck costs
 * nothing; reduced motion stops them via the global .anim-loop rule.
 */
const drift = keyframes`
  from { transform: translate3d(-50%, -50%, 0) scale(1); }
  to { transform: translate3d(calc(-50% + var(--dx)), calc(-50% + var(--dy)), 0) scale(1.15); }
`;

const Root = styled.div`
  position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
  &[data-live='false'] * { animation-play-state: paused; }
`;

const Light = styled.div.attrs({ className: 'anim-loop' })`
  position: absolute; width: 110%; aspect-ratio: 1; max-width: 120vh; border-radius: 50%;
  animation: ${drift} var(--t) ease-in-out infinite alternate;
`;

const Art = styled.div`position: absolute; inset: 0;`;

const Frame = styled.div`
  position: absolute; width: 150%; max-width: 130vh; aspect-ratio: 1;
`;

interface Props {
  type: FeedItemType;
  id: string;
  /** "r,g,b" accent of the post's type. */
  accent: string;
  live: boolean;
  /** Drawing strength — the home teaser cards use a stronger line. */
  strength?: number;
}

function FeedMotif({ type, id, accent, live, strength = 1 }: Props) {
  const seed = hashSeed(`${type}:${id}`);
  const kind = MOTIFS_BY_TYPE[type][seed % 2];
  const r = (k: number) => rnd(seed, k);
  const vars = {
    '--motif-line': `rgba(${accent}, ${(0.13 * strength).toFixed(3)})`,
    '--motif-glow': `rgba(${accent}, 0.22)`,
    '--motif-spark': `rgba(${accent}, 0.85)`,
  } as CSSProperties;

  const lights = [0, 1].map(i => ({
    left: `${Math.round(15 + r(10 + i) * 70)}%`,
    top: `${Math.round(i === 0 ? 8 + r(12) * 30 : 55 + r(13) * 35)}%`,
    background: `radial-gradient(closest-side, rgba(${accent}, ${i === 0 ? 0.2 : 0.11}), transparent)`,
    '--dx': `${Math.round((r(20 + i) - 0.5) * 30)}%`,
    '--dy': `${Math.round((r(22 + i) - 0.5) * 24)}%`,
    '--t': `${Math.round(14 + r(24 + i) * 10)}s`,
  }) as CSSProperties);

  const place: CSSProperties = {
    left: `${Math.round(30 + r(1) * 40)}%`,
    top: `${Math.round(28 + r(2) * 34)}%`,
    transform: `translate(-50%, -50%) rotate(${Math.round((r(4) - 0.5) * 28)}deg) scale(${(0.85 + r(3) * 0.4).toFixed(2)})`,
  };

  return (
    <Root data-live={live} style={vars} aria-hidden="true">
      {lights.map((s, i) => <Light key={i} style={s} />)}
      {/* html2canvas can't resolve the drawing's CSS-variable colours, so the
          shared screenshot keeps only the lights. */}
      <Art data-html2canvas-ignore="true">
        {kind === 'embers'
          ? <MotifArt kind={kind} seed={seed} />
          : <Frame style={place}><MotifArt kind={kind} seed={seed} /></Frame>}
      </Art>
    </Root>
  );
}

export default memo(FeedMotif);
