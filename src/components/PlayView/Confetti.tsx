'use client';

import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/** A light, CSS-only confetti burst; hidden entirely for reduced motion. */
const fall = keyframes`
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate3d(var(--dx), 105vh, 0) rotate(720deg); opacity: 0.9; }
`;
const Layer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: ${theme.z.toast};
  @media (prefers-reduced-motion: reduce) { display: none; }
`;
const Bit = styled.i`
  position: absolute;
  top: 0;
  width: 9px;
  height: 14px;
  border-radius: 2px;
  animation: ${fall} linear forwards;
`;

export default function Confetti({ count = 70 }: { count?: number }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 1.6 + 1.4,
    dur: 2.6 + Math.random() * 2.2,
    dx: `${(Math.random() - 0.5) * 30}vw`,
    color: [...theme.game.answers, theme.game.gold][i % 5],
  })), [count]);
  return (
    <Layer aria-hidden>
      {bits.map((b, i) => (
        <Bit key={i} style={{
          left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`,
          ['--dx' as string]: b.dx,
        }} />
      ))}
    </Layer>
  );
}
