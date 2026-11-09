'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';

const spin = keyframes`to { transform: rotate(360deg); }`;
const spinBack = keyframes`to { transform: rotate(-360deg); }`;
const breathe = keyframes`0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.06); }`;
const appear = keyframes`from { opacity: 0; transform: scale(0.82) rotate(-20deg); } to { opacity: 1; transform: none; }`;
const rise = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 0.9; }
  100% { transform: translateY(-70vh); opacity: 0; }
`;

const G = theme.game;
const SIZE = 300;
const C = SIZE / 2;

const Wrap = styled.div`
  position: relative; width: min(300px, 72vw); aspect-ratio: 1;
  transform: translate3d(calc(var(--mx, 0) * 14px), calc(var(--p, 0) * 140px + var(--my, 0) * 14px), 0)
    scale(calc(1 - var(--p, 0) * 0.18));
  opacity: calc(1 - var(--p, 0) * 1.3);
  will-change: transform, opacity;
  svg.orbit { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .letters { transform-origin: ${C}px ${C}px; animation: ${spin} 120s linear infinite; }
  .dashes { transform-origin: ${C}px ${C}px; animation: ${spinBack} 60s linear infinite; }
  @media (prefers-reduced-motion: reduce) {
    transform: none; opacity: 1;
    .letters, .dashes { animation: none; }
  }
`;

// The entrance lives on an inner layer: an animation's end state would
// otherwise override the scroll/pointer transform on Wrap.
const Inner = styled.div`
  position: absolute; inset: 0;
  animation: ${appear} 1.2s ${theme.motion.outStrong} both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Glow = styled.div`
  position: absolute; inset: 18%; border-radius: 50%;
  background: radial-gradient(circle, ${G.goldGlow} 0%, transparent 70%);
  filter: blur(18px);
  animation: ${breathe} 5s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Seal = styled.div`
  position: absolute; inset: 31%; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 35% 30%, #5A3A1C 0%, #2A1A0C 70%);
  box-shadow: 0 0 0 1.5px ${G.gold}, 0 0 0 7px rgba(226, 184, 107, 0.12), 0 18px 40px -12px rgba(0, 0, 0, 0.7);
  svg { width: 64%; height: 64%; }
`;

/** Decorative: the 22 letters circling the logo, with drifting embers behind. */
export default function HeroOrbit() {
  const letters = Array.from(HE.ABOUT_ORBIT_LETTERS);
  const R = 128;
  return (
    <Wrap aria-hidden="true">
      <Inner>
        <Glow />
        <svg className="orbit" viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={C} cy={C} r={R + 14} fill="none" stroke={G.gold} strokeOpacity="0.22" />
          <circle cx={C} cy={C} r={R - 16} fill="none" stroke={G.gold} strokeOpacity="0.16" />
          <g className="letters">
            {letters.map((l, i) => (
              // Counter-clockwise from the top: Hebrew reads right to left.
              <text key={l} x={C} y={C - R + 6} transform={`rotate(${-i * (360 / letters.length)} ${C} ${C})`}
                textAnchor="middle" fontSize="17" fontWeight="600" fill={G.goldLight}
                fillOpacity={i % 2 ? 0.55 : 0.9} style={{ fontFamily: theme.fonts.body }}>{l}</text>
            ))}
          </g>
          <g className="dashes">
            <circle cx={C} cy={C} r={R - 34} fill="none" stroke={G.gold} strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="1.5 9" strokeLinecap="round" />
            {[0, 90, 180, 270].map(a => (
              <path key={a} d={`M ${C} ${C - R + 28} l 4 6 -4 6 -4 -6 z`} fill={G.gold} transform={`rotate(${a + 45} ${C} ${C})`} />
            ))}
          </g>
        </svg>
        <Seal><OraytaLogo size={96} /></Seal>
      </Inner>
    </Wrap>
  );
}

const Ember = styled.span<{ $x: number; $d: number; $t: number; $s: number }>`
  position: absolute; bottom: -10px; left: ${p => p.$x}%;
  width: ${p => p.$s}px; height: ${p => p.$s}px; border-radius: 50%;
  background: ${G.goldLight}; box-shadow: 0 0 8px ${G.gold};
  opacity: 0;
  animation: ${rise} ${p => p.$t}s linear ${p => p.$d}s infinite;
  @media (prefers-reduced-motion: reduce) { display: none; }
`;

/** Gold motes rising through the hero (fixed positions, so SSR and client agree). */
export function Embers() {
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => (
        <Ember key={i} aria-hidden $x={(i * 37 + 11) % 100} $d={(i * 0.83) % 7} $t={8 + ((i * 1.7) % 7)} $s={2 + (i % 3)} />
      ))}
    </>
  );
}
