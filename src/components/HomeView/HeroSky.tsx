'use client';

import { CSSProperties } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * The hero's sky, lit by where the sun really is in Jerusalem: stars and a
 * rare shooting star at night, warm light at dawn and dusk, slow rays by day.
 * Purely decorative (aria-hidden) and still under reduced motion.
 */
export type SkyPhase = 'night' | 'dawn' | 'day' | 'dusk';

export function skyPhase(progress: number | null): SkyPhase {
  if (progress === null) return 'night';
  if (progress < 0.1) return 'dawn';
  if (progress > 0.88) return 'dusk';
  return 'day';
}

const twinkle = keyframes`0%, 100% { opacity: 0.15; transform: scale(0.6); } 50% { opacity: 1; transform: scale(1); }`;
const shoot = keyframes`
  0%, 88% { opacity: 0; transform: translate3d(0, 0, 0) rotate(-24deg) scaleX(0.2); }
  90% { opacity: 1; }
  96% { opacity: 0; transform: translate3d(-260px, 110px, 0) rotate(-24deg) scaleX(1); }
  100% { opacity: 0; }
`;
const turn = keyframes`to { transform: translate(-50%, -50%) rotate(360deg); }`;
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const Layer = styled.div`
  position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden;
  border-radius: inherit;
  animation: ${fadeIn} 1.2s ease both;
  @media (prefers-reduced-motion: reduce) { animation: none; * { animation: none !important; } }
`;

const Glow = styled.div<{ $phase: SkyPhase }>`
  position: absolute; inset: 0;
  background: ${p => ({
    night: theme.gilded.nightGlowCool,
    dawn: theme.gilded.dawnGlow,
    dusk: theme.gilded.duskGlow,
    day: `radial-gradient(70% 60% at var(--sun-x) 8%, rgba(255, 210, 140, 0.26), transparent 65%)`,
  }[p.$phase])};
`;

const Rays = styled.div`
  position: absolute; left: var(--sun-x); top: 14%; width: 520px; height: 520px;
  transform: translate(-50%, -50%);
  background: repeating-conic-gradient(from 0deg, rgba(255, 220, 160, 0.09) 0deg 6deg, transparent 6deg 18deg);
  -webkit-mask-image: radial-gradient(circle, #000 0%, transparent 62%);
  mask-image: radial-gradient(circle, #000 0%, transparent 62%);
  animation: ${turn} 90s linear infinite;
`;

const Star = styled.i<{ $d: number; $t: number }>`
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: ${theme.game.goldInk}; box-shadow: 0 0 6px rgba(255, 243, 214, 0.8);
  animation: ${twinkle} ${p => p.$t}s ease-in-out ${p => p.$d}s infinite;
  &.big { width: 3px; height: 3px; }
`;

const Shooting = styled.i`
  position: absolute; top: 12%; left: 78%; width: 90px; height: 1.5px; border-radius: 2px; opacity: 0;
  transform-origin: left center;
  background: linear-gradient(90deg, rgba(255, 243, 214, 0.95), transparent);
  animation: ${shoot} 17s ${theme.motion.out} 4s infinite;
`;

const Glare = styled.div`
  position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s ease;
  background: radial-gradient(340px circle at var(--gx, 50%) var(--gy, 50%), rgba(226, 184, 107, 0.16), transparent 70%);
  @media (hover: hover) and (pointer: fine) { section:hover & { opacity: 1; } }
`;

// A fixed scatter (hashed, so it doesn't fall into rows). The hero renders on
// the client only, so there is no server markup to match.
const rand = (n: number) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
const STARS = Array.from({ length: 26 }, (_, i) => ({
  x: Math.round(rand(i + 1) * 1000) / 10,
  y: Math.round(rand(i + 101) * 640) / 10,
  d: rand(i + 201) * 4,
  t: 2.4 + rand(i + 301) * 2.6,
  big: i % 7 === 0,
}));

export default function HeroSky({ phase, progress }: { phase: SkyPhase; progress: number | null }) {
  // The arc sits at the card's left; the sun crosses it right → left.
  const sunX = `${(4 + (1 - (progress ?? 0.5)) * 26).toFixed(1)}%`;
  const showStars = phase === 'night' || phase === 'dusk';
  return (
    <Layer aria-hidden style={{ '--sun-x': sunX } as CSSProperties}>
      <Glow $phase={phase} />
      {phase === 'day' && <Rays />}
      {showStars && STARS.filter((_, i) => phase === 'night' || i % 3 === 0).map((s, i) => (
        <Star key={i} className={s.big ? 'big' : undefined} $d={s.d} $t={s.t} style={{ left: `${s.x}%`, top: `${s.y}%` }} />
      ))}
      {phase === 'night' && <Shooting />}
      <Glare />
    </Layer>
  );
}
