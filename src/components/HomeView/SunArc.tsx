'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * The day at a glance: a gold arc from sunrise (right) to sunset (left) with
 * the sun on it at the current moment; after dark a crescent moon instead.
 * Decorative — the same information is in the hero's text.
 */
const Svg = styled.svg`
  display: block; overflow: visible;
  width: 112px; height: 64px;
  ${theme.up.md} { width: 140px; height: 80px; }
`;

const W = 140;
const H = 80;
const R = 62;
const CX = W / 2;
const CY = H - 6;

interface Props {
  /** 0 = sunrise … 1 = sunset; null = night. */
  progress: number | null;
}

export default function SunArc({ progress }: Props) {
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
        <g transform={`translate(${CX} ${CY - R * 0.62})`}>
          <path d="M 7 -12 A 13 13 0 1 0 7 12 A 10 10 0 1 1 7 -12 Z" fill={theme.game.goldLight} opacity="0.95" />
          <circle cx="-34" cy="-6" r="1.2" fill={theme.game.goldInk} opacity="0.8" />
          <circle cx="30" cy="-14" r="1" fill={theme.game.goldInk} opacity="0.7" />
          <circle cx="40" cy="8" r="0.9" fill={theme.game.goldInk} opacity="0.6" />
        </g>
      ) : (
        <>
          <circle cx={sx} cy={sy} r="16" fill="url(#sunGlow)" />
          <circle cx={sx} cy={sy} r="6.5" fill={theme.game.goldLight} />
        </>
      )}
    </Svg>
  );
}
