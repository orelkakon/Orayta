'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

/**
 * Countdown ring driven by requestAnimationFrame against the server clock,
 * so it never drifts between devices. Turns red in the last 5 seconds.
 */
const Wrap = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  flex: none;
`;
const Num = styled.span<{ $urgent: boolean; $size: number }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => Math.round($size * 0.36)}px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ $urgent }) => ($urgent ? theme.game.wrong : theme.game.ink)};
`;

interface Props { opensAt: number; endsAt: number; now: () => number; size?: number; }

export default function TimerRing({ opensAt, endsAt, now, size = 72 }: Props) {
  const circle = useRef<SVGCircleElement>(null);
  const [secs, setSecs] = useState(Math.ceil((endsAt - opensAt) / 1000));
  const r = 44;
  const len = 2 * Math.PI * r;

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const t = now();
      const left = Math.max(0, endsAt - Math.max(t, opensAt));
      const frac = left / Math.max(1, endsAt - opensAt);
      if (circle.current) {
        circle.current.style.strokeDashoffset = String(len * (1 - frac));
        circle.current.style.stroke = left <= 5000 ? theme.game.wrong : theme.game.gold;
      }
      setSecs(Math.ceil(left / 1000));
      if (left > 0) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [opensAt, endsAt, now, len]);

  return (
    <Wrap $size={size} role="timer" aria-label={HE.PLAY_ARIA_TIMER(secs)}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke={theme.game.glassLine} strokeWidth="9" />
        <circle ref={circle} cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={len} strokeDashoffset={0} />
      </svg>
      <Num $urgent={secs <= 5} $size={size} aria-hidden>{secs}</Num>
    </Wrap>
  );
}
