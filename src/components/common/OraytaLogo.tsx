'use client';

import { useId } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * Orayta's seal: a gilded medallion holding an open Torah scroll (two עצי
 * חיים, parchment, the א.ק initials) under a כתר תורה. Self-contained
 * espresso disc, so it reads on any background.
 *
 * `animated`: the scroll unrolls from its centre as the rollers part, the
 * crown settles on top and its jewels catch the light; afterwards a gold
 * sheen crosses the seal now and then. Static everywhere else (small icons,
 * previews). All motion is transform/opacity on a few tiny shapes.
 */
const unroll = keyframes`from { transform: scaleX(0.04); } to { transform: none; }`;
const partL = keyframes`from { transform: translateX(8.6px); } to { transform: none; }`;
const partR = keyframes`from { transform: translateX(-8.6px); } to { transform: none; }`;
const appear = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const crownIn = keyframes`
  from { opacity: 0; transform: translateY(-4px) scale(0.7); }
  to { opacity: 1; transform: none; }
`;
const twinkle = keyframes`
  0%, 70%, 100% { opacity: 0.55; transform: scale(0.8); }
  80% { opacity: 1; transform: scale(1.5); }
`;
const sweep = keyframes`
  0% { transform: translateX(0) skewX(-22deg); }
  16%, 100% { transform: translateX(92px) skewX(-22deg); }
`;

const Svg = styled.svg<{ $animated: boolean }>`
  display: block; flex-shrink: 0; overflow: visible;
  .lg-paper, .lg-roll-l, .lg-roll-r, .lg-crown, .lg-jewel, .lg-sheen {
    transform-box: view-box;
  }
  .lg-paper { transform-origin: 24px 25.5px; }
  .lg-crown { transform-origin: 24px 12px; transition: transform 0.35s ${theme.motion.spring}; }
  .lg-sheen { transform: translateX(0) skewX(-22deg); }
  ${p => p.$animated && css`
    .lg-paper { animation: ${unroll} 0.9s ${theme.motion.outStrong} 0.2s both; }
    .lg-roll-l { animation: ${partL} 0.9s ${theme.motion.outStrong} 0.2s both; }
    .lg-roll-r { animation: ${partR} 0.9s ${theme.motion.outStrong} 0.2s both; }
    .lg-ink { animation: ${appear} 0.5s ease 0.85s both; }
    .lg-crown { animation: ${crownIn} 0.6s ${theme.motion.spring} 0.75s backwards; }
    .lg-jewel { animation: ${twinkle} 5s ease-in-out infinite; }
    .lg-jewel:nth-of-type(1) { animation-delay: 1.3s; transform-origin: 16px 9.6px; }
    .lg-jewel:nth-of-type(2) { animation-delay: 1.45s; transform-origin: 24px 7.6px; }
    .lg-jewel:nth-of-type(3) { animation-delay: 1.6s; transform-origin: 32px 9.6px; }
    .lg-sheen { animation: ${sweep} 8s ${theme.motion.inOut} 1.6s infinite; }
    @media (hover: hover) and (pointer: fine) {
      a:hover > & .lg-crown, &:hover .lg-crown { transform: translateY(-1.2px); }
    }
  `}
`;

interface Props {
  size?: number;
  animated?: boolean;
}

export default function OraytaLogo({ size = 44, animated = false }: Props) {
  const uid = useId().replace(/:/g, '');
  const gold = `lg-gold-${uid}`;
  const disc = `lg-disc-${uid}`;
  const paper = `lg-parch-${uid}`;
  const shine = `lg-shine-${uid}`;
  const clip = `lg-clip-${uid}`;
  const loop = animated ? 'anim-loop' : undefined;
  return (
    <Svg
      $animated={animated} width={size} height={size} viewBox="0 0 48 48"
      fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    >
      <defs>
        <linearGradient id={gold} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F8DFA4" />
          <stop offset="0.45" stopColor={theme.game.gold} />
          <stop offset="1" stopColor="#9C6A2A" />
        </linearGradient>
        <radialGradient id={disc} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#5A3A1C" />
          <stop offset="0.65" stopColor="#2A1A0C" />
          <stop offset="1" stopColor="#170E06" />
        </radialGradient>
        <linearGradient id={paper} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF7E3" />
          <stop offset="1" stopColor="#E9D2A4" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF3D6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFF3D6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFF3D6" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clip}><circle cx="24" cy="24" r="22.2" /></clipPath>
      </defs>

      {/* Medallion */}
      <circle cx="24" cy="24" r="23" fill={`url(#${disc})`} stroke={`url(#${gold})`} strokeWidth="1.6" />
      <circle cx="24" cy="24" r="20.3" stroke={`url(#${gold})`} strokeOpacity="0.4" strokeWidth="0.6" />

      {/* Parchment with a column of writing and the initials */}
      <g className="lg-paper">
        <rect x="14" y="18" width="20" height="15.5" rx="1.2" fill={`url(#${paper})`} />
        <g className="lg-ink">
          <path d="M17 21H31M18.5 31H29.5" stroke="#8A6428" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
          <text
            x="24" y="28.4" textAnchor="middle" fontSize="7.6" fontWeight="700"
            fontFamily="'Frank Ruhl Libre', serif" fill={theme.bot.line} direction="rtl"
          >
            א.ק
          </text>
        </g>
      </g>

      {/* עצי חיים — the two rollers with their handles */}
      <g className="lg-roll-l" fill={`url(#${gold})`}>
        <rect x="10.6" y="16.6" width="3.8" height="18.8" rx="1.9" />
        <rect x="11.8" y="14.3" width="1.4" height="3" rx="0.7" />
        <rect x="11.8" y="34.7" width="1.4" height="3" rx="0.7" />
      </g>
      <g className="lg-roll-r" fill={`url(#${gold})`}>
        <rect x="33.6" y="16.6" width="3.8" height="18.8" rx="1.9" />
        <rect x="34.8" y="14.3" width="1.4" height="3" rx="0.7" />
        <rect x="34.8" y="34.7" width="1.4" height="3" rx="0.7" />
      </g>

      {/* כתר תורה */}
      <g className="lg-crown">
        <path d="M17.2 14.6 16 9.9l3.9 2.6L24 8.2l4.1 4.3 3.9-2.6-1.2 4.7Z" fill={`url(#${gold})`} />
        <rect x="17.2" y="14.3" width="13.6" height="1.5" rx="0.75" fill={`url(#${gold})`} />
        <circle className={`lg-jewel ${loop ?? ''}`} cx="16" cy="9.6" r="0.95" fill={theme.game.goldInk} />
        <circle className={`lg-jewel ${loop ?? ''}`} cx="24" cy="7.6" r="1.15" fill={theme.game.goldInk} />
        <circle className={`lg-jewel ${loop ?? ''}`} cx="32" cy="9.6" r="0.95" fill={theme.game.goldInk} />
      </g>

      {/* A light that crosses the seal now and then */}
      <g clipPath={`url(#${clip})`}>
        <rect className={`lg-sheen ${loop ?? ''}`} x="-24" y="-4" width="12" height="56" fill={`url(#${shine})`} />
      </g>
    </Svg>
  );
}
