'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * פתיחת ההיכל — once a day, the home hero opens like the Aron Kodesh: a wine
 * velvet פרוכת with a gold כתר תורה parts to both sides and a light spills
 * from behind it. The hero is already rendered underneath (nothing waits on
 * this), taps pass through, and it unmounts after 1.9s. Skipped under
 * reduced motion (the OS setting or the accessibility widget's).
 */
const KEY = 'orayta_ark_day';
const VELVET = '#5C1323';
const VELVET_DEEP = '#2E0710';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function shouldOpen(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (document.documentElement.dataset.accMotion === 'on') return false;
    return localStorage.getItem(KEY) !== todayKey();
  } catch { return false; }
}

const pullL = keyframes`
  0%, 18% { transform: none; }
  100% { transform: translate3d(-34%, 0, 0) scaleX(0.18); opacity: 0; }
`;
const pullR = keyframes`
  0%, 18% { transform: none; }
  100% { transform: translate3d(34%, 0, 0) scaleX(0.18); opacity: 0; }
`;
const shine = keyframes`
  0%, 14% { opacity: 0; transform: scaleX(0.05); }
  45% { opacity: 1; transform: scaleX(0.7); }
  100% { opacity: 0; transform: scaleX(1.6); }
`;

const Stage = styled.div`
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  overflow: hidden; border-radius: inherit;
`;

const Light = styled.div`
  position: absolute; inset: -10% 0;
  background: radial-gradient(40% 60% at 50% 45%, rgba(255, 236, 190, 0.95), rgba(226, 184, 107, 0.45) 45%, transparent 75%);
  animation: ${shine} 1.7s ${theme.motion.out} both;
`;

const Half = styled.div<{ $side: 'l' | 'r' }>`
  position: absolute; top: 0; bottom: 0; width: 50.5%; overflow: hidden;
  ${p => (p.$side === 'l' ? 'left: 0; transform-origin: left center;' : 'right: 0; transform-origin: right center;')}
  /* Velvet pleats over a lit-from-above wine gradient. */
  background:
    repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.26) 0 7px, rgba(255, 255, 255, 0.05) 9px 12px, rgba(0, 0, 0, 0) 14px 22px),
    linear-gradient(180deg, ${VELVET} 0%, ${VELVET_DEEP} 100%);
  animation: ${p => (p.$side === 'l' ? pullL : pullR)} 1.5s ${theme.motion.inOut} 0.15s both;
  /* Gold trim along the seam and an embroidered band above the fringe. */
  &::before {
    content: ''; position: absolute; top: 0; bottom: 0; width: 3px;
    ${p => (p.$side === 'l' ? 'right: 0;' : 'left: 0;')}
    background: ${theme.gilded.fill};
  }
  &::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 30px;
    background:
      linear-gradient(${theme.game.gold}, ${theme.game.gold}) 0 0 / 100% 2px no-repeat,
      linear-gradient(${theme.game.gold}, ${theme.game.gold}) 0 6px / 100% 1px no-repeat,
      repeating-linear-gradient(90deg, ${theme.game.goldDeep} 0 2px, transparent 2px 5px) 0 12px / 100% 18px no-repeat;
  }
`;

/* One crown drawn across the seam: each half shows its own side of it. */
const Crown = styled.svg<{ $side: 'l' | 'r' }>`
  position: absolute; top: 50%; width: 64px; height: 64px;
  ${p => (p.$side === 'l' ? 'right: 0; transform: translate(50%, -60%);' : 'left: 0; transform: translate(-50%, -60%);')}
`;

function CrownArt({ side }: { side: 'l' | 'r' }) {
  return (
    <Crown $side={side} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 42 11 20l11 9 10-15 10 15 11-9-3 22Z" fill={theme.game.gold} stroke={theme.game.goldLight} strokeWidth="1" />
      <rect x="13" y="42" width="38" height="6" rx="3" fill={theme.game.goldDeep} />
      <circle cx="11" cy="19" r="2.6" fill={theme.game.goldInk} />
      <circle cx="32" cy="13" r="3" fill={theme.game.goldInk} />
      <circle cx="53" cy="19" r="2.6" fill={theme.game.goldInk} />
    </Crown>
  );
}

export default function ArkCurtain() {
  const [open] = useState(shouldOpen);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    try { localStorage.setItem(KEY, todayKey()); } catch {}
    const t = window.setTimeout(() => setDone(true), 1900);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open || done) return null;
  return (
    <Stage aria-hidden="true">
      <Light />
      <Half $side="l"><CrownArt side="l" /></Half>
      <Half $side="r"><CrownArt side="r" /></Half>
    </Stage>
  );
}
