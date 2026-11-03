'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/** The double-tap heart: pops out exactly where the finger landed. */
const burst = keyframes`
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(var(--tilt)); }
  18%  { opacity: 1; transform: translate(-50%, -50%) scale(1.15) rotate(var(--tilt)); }
  32%  { transform: translate(-50%, -50%) scale(0.95) rotate(var(--tilt)); }
  70%  { opacity: 1; transform: translate(-50%, -62%) scale(1) rotate(var(--tilt)); }
  100% { opacity: 0; transform: translate(-50%, -120%) scale(0.85) rotate(var(--tilt)); }
`;

const Heart = styled.span`
  position: absolute; z-index: 50; pointer-events: none;
  width: 96px; height: 96px;
  animation: ${burst} 0.8s ${theme.motion.outStrong} forwards;
  filter: drop-shadow(0 6px 18px ${theme.onMedia.likeGlow});
  svg { width: 100%; height: 100%; display: block; }
`;

export interface HeartPoint { id: number; x: number; y: number; tilt: number }

export default function DoubleTapHeart({ x, y, tilt }: HeartPoint) {
  return (
    <Heart style={{ left: x, top: y, ['--tilt' as string]: `${tilt}deg` }} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <defs>
          <linearGradient id="dtHeart" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.onMedia.likeLight} />
            <stop offset="100%" stopColor={theme.onMedia.like} />
          </linearGradient>
        </defs>
        <path
          fill="url(#dtHeart)"
          d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.6 0 5.8 3.6 4.5 7.1-1.8 4.8-9.3 9.4-9.3 9.4z"
        />
      </svg>
    </Heart>
  );
}
