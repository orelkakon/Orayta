'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * The hero's candle flames, shared by the Chanukah menorah and the Shabbat
 * candles: an HTML flame (radial gradient) standing on its wick, a soft halo
 * that breathes, and a flicker. Place a `Wick` with `left`/`top` on the wick
 * tip and `--d` (ignite delay), `--t` (flicker period), `--o` (phase offset);
 * its width comes from the stage's `--wick-w`.
 */
export const FLAME = 'radial-gradient(60% 70% at 50% 72%, #FFFBEA 0%, #FFD98A 42%, #F2994A 78%, rgba(242, 153, 74, 0) 100%)';
export const HALO = 'radial-gradient(closest-side, rgba(255, 205, 120, 0.5), rgba(255, 205, 120, 0))';
/** Candlelight spilling over the night card. */
export const CANDLE_GLOW = 'radial-gradient(closest-side, rgba(255, 196, 120, 0.3), rgba(242, 153, 74, 0.1) 48%, rgba(242, 153, 74, 0))';

export const ignite = keyframes`
  from { opacity: 0; transform: translate(-50%, -100%) scale(0); }
  to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
`;
export const flicker = keyframes`
  0%, 100% { transform: scale(1, 1) rotate(-2deg); }
  30% { transform: scale(0.9, 1.1) rotate(2.5deg); }
  62% { transform: scale(1.06, 0.93) rotate(-1deg); }
`;
export const breathe = keyframes`from { opacity: 0.55; } to { opacity: 1; }`;

export const Wick = styled.span`
  position: absolute; width: var(--wick-w, 4.6%); aspect-ratio: 7 / 13;
  transform: translate(-50%, -100%); transform-origin: 50% 100%;
  animation: ${ignite} 0.5s ${theme.motion.spring} var(--d) both;
`;
export const Halo = styled.i.attrs({ className: 'anim-loop' })`
  position: absolute; left: 50%; top: 40%; width: 420%; aspect-ratio: 1; margin: -210% 0 0 -210%;
  border-radius: 50%; background: ${HALO};
  animation: ${breathe} var(--t) ease-in-out var(--o) infinite alternate;
`;
export const Flame = styled.i.attrs({ className: 'anim-loop' })`
  position: absolute; inset: 0; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: ${FLAME}; transform-origin: 50% 100%;
  animation: ${flicker} var(--t) ease-in-out var(--o) infinite;
`;
