'use client';

import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const flicker = keyframes`
  0%, 100% { transform: scale(1, 1) rotate(-1deg); opacity: 1; }
  25% { transform: scale(0.94, 1.06) rotate(1.5deg); opacity: 0.93; }
  50% { transform: scale(1.04, 0.95) rotate(-2deg); opacity: 1; }
  75% { transform: scale(0.97, 1.04) rotate(1deg); opacity: 0.95; }
`;
const ignite = keyframes`
  from { transform: scale(0.1); opacity: 0; } 60% { transform: scale(1.2); opacity: 1; } to { transform: scale(1); }
`;
const glowPulse = keyframes`0%, 100% { opacity: 0.55; } 50% { opacity: 0.85; }`;

const Wrap = styled.div`position: relative; width: 120px; height: 170px; margin: 0 auto;`;

const Glow = styled.div<{ $lit: boolean }>`
  position: absolute; left: 50%; top: 4px; width: 150px; height: 150px; translate: -50% 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,196,92,0.55) 0%, rgba(255,160,60,0.18) 40%, transparent 70%);
  opacity: 0; transition: opacity 0.8s ease; pointer-events: none;
  ${p => p.$lit && css`opacity: 0.7; animation: ${glowPulse} 3s ease-in-out infinite;`}
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Flame = styled.g<{ $lit: boolean }>`
  transform-box: fill-box; transform-origin: 50% 100%;
  ${p => (p.$lit
    ? css`animation: ${ignite} 0.6s ${theme.motion.spring} both, ${flicker} 1.6s ease-in-out 0.6s infinite;`
    : css`opacity: 0;`)}
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

/** A memorial candle: wick only until lit, then an igniting, softly flickering flame. */
export default function HilulaCandle({ lit }: { lit: boolean }) {
  return (
    <Wrap aria-hidden="true">
      <Glow $lit={lit} />
      <svg viewBox="0 0 120 170" width="120" height="170" style={{ position: 'relative' }}>
        <defs>
          <linearGradient id="hc-glass" x1="0" x2="1">
            <stop offset="0" stopColor="#E9D9B8" /><stop offset="0.5" stopColor="#FBF4E4" /><stop offset="1" stopColor="#D9C59E" />
          </linearGradient>
          <radialGradient id="hc-flame" cx="50%" cy="70%" r="60%">
            <stop offset="0" stopColor="#FFFBE8" /><stop offset="0.45" stopColor="#FFD36B" /><stop offset="1" stopColor="#FF8A2A" />
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="160" rx="38" ry="6" fill="rgba(0,0,0,0.15)" />
        <path d="M30 82 h60 l-4 74 a4 4 0 0 1 -4 4 h-44 a4 4 0 0 1 -4 -4 z" fill="url(#hc-glass)" stroke="#C4956A" strokeWidth="1.2" />
        <path d="M34 98 h52" stroke="#C4956A" strokeOpacity="0.45" />
        <text x="60" y="131" textAnchor="middle" fontSize="12" fill="#8A6236" fontFamily="serif">{HE.HILULA_CANDLE_LABEL}</text>
        <ellipse cx="60" cy="82" rx="30" ry="5" fill="#F3E6C8" stroke="#C4956A" strokeWidth="1.2" />
        <path d="M60 80 v-9" stroke="#3A2A1A" strokeWidth="2" strokeLinecap="round" />
        <Flame $lit={lit}>
          <path d="M60 22 C 72 42, 74 56, 60 72 C 46 56, 48 42, 60 22 Z" fill="url(#hc-flame)" />
          <path d="M60 48 C 65 56, 65 62, 60 69 C 55 62, 55 56, 60 48 Z" fill="#FFFDF4" opacity="0.9" />
        </Flame>
      </svg>
    </Wrap>
  );
}
