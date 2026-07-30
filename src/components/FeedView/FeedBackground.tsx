'use client';

import { useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';

const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');

const d1 = keyframes`0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(16px,-22px) rotate(7deg)}`;
const d2 = keyframes`0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(-20px,14px) rotate(-6deg)}`;
const d3 = keyframes`0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(10px,18px) rotate(9deg)}`;
const d4 = keyframes`0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(-13px,-16px) rotate(-8deg)}`;
const d5 = keyframes`0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(18px,10px) rotate(5deg)}`;

const DRIFTS = [d1, d2, d3, d4, d5];

const Letter = styled.div<{
  $x: number; $y: number; $size: number; $opacity: number;
  $dur: number; $delay: number; $drift: number;
}>`
  position: fixed;
  left: ${p => p.$x}%;
  top: ${p => p.$y}%;
  font-size: ${p => p.$size}rem;
  opacity: ${p => p.$opacity};
  color: white;
  font-family: var(--font-frank, serif);
  pointer-events: none;
  user-select: none;
  z-index: 1;
  ${p => css`animation: ${DRIFTS[p.$drift]} ${p.$dur}s ease-in-out infinite ${p.$delay}s;`}
`;

const Container = styled.div`
  position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
`;

// Darkened edges pull the eye toward the centered text and give the flat
// gradients a sense of depth — like reading by lamplight.
const Vignette = styled.div`
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(130% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.42) 100%);
`;

// Fine film grain keeps the large dark surfaces from looking like flat vector
// fills; barely perceptible but removes the "web page" feeling.
const Grain = styled.div`
  position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-size: 140px 140px;
`;

function seeded(seed: number, max: number) {
  return ((seed * 1664525 + 1013904223) >>> 0) % max;
}

export default function FeedBackground() {
  const letters = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      char: LETTERS[seeded(i * 7, LETTERS.length)],
      x: seeded(i * 13, 90) + 2,
      y: seeded(i * 17, 88) + 2,
      size: (seeded(i * 11, 40) + 14) / 10,
      opacity: (seeded(i * 19, 20) + 12) / 1000,
      dur: seeded(i * 23, 35) + 40,
      delay: seeded(i * 29, 20),
      drift: seeded(i * 31, 5),
    }));
  }, []);

  return (
    <>
      <Container>
        {letters.map((l, i) => (
          <Letter key={i} $x={l.x} $y={l.y} $size={l.size} $opacity={l.opacity}
            $dur={l.dur} $delay={l.delay} $drift={l.drift}
          >
            {l.char}
          </Letter>
        ))}
      </Container>
      <Vignette />
      <Grain />
    </>
  );
}
