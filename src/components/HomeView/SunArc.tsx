'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * The day at a glance: a gold arc from sunrise (right) to sunset (left) with
 * the sun on it at the current moment; after dark a crescent moon instead.
 * Decorative — the same information is in the hero's text.
 */
const halo = keyframes`0%, 100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.25); opacity: 1; }`;
const moonUp = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; }`;

const Svg = styled.svg`
  display: block; overflow: visible;
  width: 112px; height: 64px;
  ${theme.up.md} { width: 140px; height: 80px; }
  .halo { transform-box: fill-box; transform-origin: center; animation: ${halo} 4s ease-in-out infinite; }
  .moon { animation: ${moonUp} 1.1s ${theme.motion.outStrong} both; }
  @media (prefers-reduced-motion: reduce) { .halo, .moon { animation: none; } }
`;

const RISE_MS = 1400;

/** The sun's place on the arc, travelling from sunrise to `target` on first show. */
function useRisingProgress(target: number | null): number | null {
  const [shown, setShown] = useState<number | null>(target === null ? null : 0);
  const done = useRef(false);
  useEffect(() => {
    if (target === null || done.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done.current = true;
      setShown(target);
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function step(t) {
      const k = Math.min(1, (t - start) / RISE_MS);
      setShown(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) frame = requestAnimationFrame(step);
      else done.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return shown;
}

const W = 140;
const H = 80;
const R = 62;
const CX = W / 2;
const CY = H - 6;

interface Props {
  /** 0 = sunrise … 1 = sunset; null = night. */
  progress: number | null;
}

export default function SunArc({ progress: target }: Props) {
  const progress = useRisingProgress(target);
  const night = progress === null;
  // RTL day: the sun rises on the right and travels left.
  const angle = Math.PI * (night ? 0.5 : Math.min(1, Math.max(0, progress)));
  const sx = CX + R * Math.cos(angle);
  const sy = CY - R * Math.sin(angle);
  const arc = `M ${CX + R} ${CY} A ${R} ${R} 0 0 0 ${CX - R} ${CY}`;
  const travelled = `M ${CX + R} ${CY} A ${R} ${R} 0 0 0 ${sx} ${sy}`;

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.game.goldLight} stopOpacity="0.9" />
          <stop offset="100%" stopColor={theme.game.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1="4" y1={CY} x2={W - 4} y2={CY} stroke={theme.gilded.nightLine} strokeWidth="1" />
      <path d={arc} fill="none" stroke={theme.gilded.nightLine} strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
      {!night && <path d={travelled} fill="none" stroke={theme.game.gold} strokeWidth="2" strokeLinecap="round" />}
      {night ? (
        <g transform={`translate(${CX} ${CY - R * 0.62})`}><g className="moon">
          <path d="M 7 -12 A 13 13 0 1 0 7 12 A 10 10 0 1 1 7 -12 Z" fill={theme.game.goldLight} opacity="0.95" />
          <circle cx="-34" cy="-6" r="1.2" fill={theme.game.goldInk} opacity="0.8" />
          <circle cx="30" cy="-14" r="1" fill={theme.game.goldInk} opacity="0.7" />
          <circle cx="40" cy="8" r="0.9" fill={theme.game.goldInk} opacity="0.6" />
        </g></g>
      ) : (
        <>
          <circle className="halo" cx={sx} cy={sy} r="16" fill="url(#sunGlow)" />
          <circle cx={sx} cy={sy} r="6.5" fill={theme.game.goldLight} />
        </>
      )}
    </Svg>
  );
}
