'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/** Pulsing red vignette for the last five seconds of a question. */
const beat = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
`;
const Layer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${theme.z.sticky};
  box-shadow: inset 0 0 90px 18px ${theme.game.urgent};
  animation: ${beat} 1s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; opacity: 0.6; }
`;

export default function UrgentGlow({ opensAt, endsAt, now, off = false }: { opensAt: number; endsAt: number; now: () => number; off?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      const t = now();
      setOn(t >= opensAt && t < endsAt && endsAt - t <= 5000);
    }, 150);
    return () => clearInterval(id);
  }, [opensAt, endsAt, now]);
  return on && !off ? <Layer aria-hidden /> : null;
}
