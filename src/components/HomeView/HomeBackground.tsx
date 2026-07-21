'use client';

import styled, { keyframes } from 'styled-components';

/* Luxury ambient background for the homepage only: slow-drifting warm gold
 * glows, faint twinkling specks and a soft vignette. Sits behind the content
 * (z-index 0) and is purely decorative — pointer-events: none throughout.
 * Accessibility: html[data-acc-motion="on"] globally disables all animation. */

const drift1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(-60px, 40px) scale(1.15); }
`;

const drift2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(70px, -30px) scale(1.1); }
`;

const drift3 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1.05); }
  50%       { transform: translate(-40px, -50px) scale(0.95); }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.12; transform: scale(0.8); }
  50%       { opacity: 0.55; transform: scale(1.15); }
`;

const Wrap = styled.div`
  position: fixed; inset: 0; z-index: 0;
  pointer-events: none; overflow: hidden;
`;

const Blob = styled.div`
  position: absolute; border-radius: 50%; filter: blur(90px);
  will-change: transform;
`;

const BlobGold = styled(Blob)`
  width: 55vw; height: 55vw; max-width: 620px; max-height: 620px;
  top: -12%; right: -14%;
  background: radial-gradient(circle, rgba(212,165,116,0.32), transparent 70%);
  animation: ${drift1} 16s ease-in-out infinite;
  html[data-theme="dark"] & { background: radial-gradient(circle, rgba(212,165,116,0.14), transparent 70%); }
`;

const BlobBronze = styled(Blob)`
  width: 48vw; height: 48vw; max-width: 540px; max-height: 540px;
  bottom: -10%; left: -12%;
  background: radial-gradient(circle, rgba(139,98,64,0.26), transparent 70%);
  animation: ${drift2} 20s ease-in-out infinite;
  html[data-theme="dark"] & { background: radial-gradient(circle, rgba(139,98,64,0.16), transparent 70%); }
`;

const BlobWine = styled(Blob)`
  width: 36vw; height: 36vw; max-width: 420px; max-height: 420px;
  top: 38%; left: 30%;
  background: radial-gradient(circle, rgba(155,35,53,0.10), transparent 70%);
  animation: ${drift3} 24s ease-in-out infinite;
  html[data-theme="dark"] & { background: radial-gradient(circle, rgba(201,75,95,0.08), transparent 70%); }
`;

/* delicate gold speck that fades in and out */
const Speck = styled.span<{ $top: string; $right: string; $delay: string; $dur: string; $size: string }>`
  position: absolute; top: ${p => p.$top}; right: ${p => p.$right};
  width: ${p => p.$size}; height: ${p => p.$size}; border-radius: 50%;
  background: radial-gradient(circle, rgba(212,165,116,0.9), rgba(212,165,116,0) 70%);
  animation: ${twinkle} ${p => p.$dur} ease-in-out ${p => p.$delay} infinite;
`;

const Vignette = styled.div`
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 30%, transparent 55%, rgba(92,61,30,0.07) 100%);
  html[data-theme="dark"] & { background: radial-gradient(ellipse at 50% 30%, transparent 55%, rgba(0,0,0,0.35) 100%); }
`;

const SPECKS = [
  { top: '16%', right: '12%', delay: '0s',   dur: '4.2s', size: '5px' },
  { top: '28%', right: '78%', delay: '1.1s', dur: '5.1s', size: '4px' },
  { top: '46%', right: '22%', delay: '2.3s', dur: '4.6s', size: '6px' },
  { top: '58%', right: '64%', delay: '0.6s', dur: '5.6s', size: '4px' },
  { top: '72%', right: '38%', delay: '1.8s', dur: '4.4s', size: '5px' },
  { top: '82%', right: '80%', delay: '2.9s', dur: '5.3s', size: '4px' },
  { top: '12%', right: '46%', delay: '3.4s', dur: '4.8s', size: '4px' },
];

export default function HomeBackground() {
  return (
    <Wrap aria-hidden>
      <BlobGold />
      <BlobBronze />
      <BlobWine />
      {SPECKS.map((s, i) => (
        <Speck key={i} $top={s.top} $right={s.right} $delay={s.delay} $dur={s.dur} $size={s.size} />
      ))}
      <Vignette />
    </Wrap>
  );
}
