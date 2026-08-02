'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FeedDedicationSlide } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';

const DedSlide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: linear-gradient(168deg, #0A0710 0%, #140B1E 50%, #0A0710 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 40px 32px; text-align: center;
  border-top: 1px solid rgba(200,170,100,0.08);
`;

/* The most emotionally loaded slides in the deck deserve a quiet entrance —
   each element settles into place instead of just being there. */
const Reveal = styled.div<{ $v: boolean; $d: string }>`
  opacity: ${p => (p.$v ? 1 : 0)};
  transform: ${p => (p.$v ? 'none' : 'translateY(14px)')};
  transition: opacity 0.7s ${p => p.$d} ease, transform 0.7s ${p => p.$d} cubic-bezier(0.22, 1, 0.36, 1);
`;

const amenGlow = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(226, 190, 120, 0.45); }
  100% { box-shadow: 0 0 0 22px rgba(226, 190, 120, 0); }
`;

const AmenBtn = styled.button<{ $done: boolean }>`
  margin-top: 10px;
  padding: 9px 30px; border-radius: 22px;
  font-family: var(--font-frank, serif); font-size: 1.05rem; font-weight: 700;
  color: ${p => (p.$done ? '#1E1504' : 'rgba(226, 190, 120, 0.92)')};
  background: ${p => (p.$done ? 'linear-gradient(135deg, rgba(226,190,120,0.95), #EDCB85)' : 'rgba(226, 190, 120, 0.07)')};
  border: 1px solid rgba(226, 190, 120, ${p => (p.$done ? 0.9 : 0.4)});
  transition: background 0.3s ease, color 0.3s ease, transform 0.15s ease;
  animation: ${p => (p.$done ? amenGlow : 'none')} 0.7s ease-out;
  &:active { transform: scale(0.93); }
`;

const Orn = styled.div`
  display: flex; align-items: center; gap: 10px;
  color: rgba(226,190,120,0.55); font-size: 0.5rem; line-height: 1;
  &::before, &::after {
    content: ''; width: 40px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(226,190,120,0.45));
  }
  &::after { background: linear-gradient(270deg, transparent, rgba(226,190,120,0.45)); }
`;

const flicker = keyframes`
  0%,100% { transform: scaleX(1) scaleY(1); opacity: 0.92; }
  20%      { transform: scaleX(0.88) scaleY(1.06); opacity: 1; }
  45%      { transform: scaleX(1.1) scaleY(0.95); opacity: 0.85; }
  70%      { transform: scaleX(0.93) scaleY(1.09); opacity: 0.95; }
`;

const CandleWrap = styled.div`position: relative; width: 28px; height: 46px; margin: 0 auto;`;
const Flame = styled.div`
  position: absolute; bottom: 12px; left: 0; right: 0; margin: auto;
  width: 18px; height: 28px;
  background: radial-gradient(ellipse at 50% 80%, #fff8a0 0%, #ffbe00 38%, #ff6200 68%, transparent 100%);
  border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%;
  animation: ${flicker} 0.55s ease-in-out infinite;
  box-shadow: 0 0 14px 5px rgba(255,140,0,0.45), 0 0 36px 10px rgba(255,90,0,0.12);
`;
const Wick = styled.div`
  position: absolute; bottom: 10px; left: 0; right: 0; margin: auto;
  width: 2px; height: 8px; background: #3a2000; border-radius: 1px; z-index: 1;
`;
const CandleBase = styled.div`
  position: absolute; bottom: 0; left: 0; right: 0; margin: auto;
  width: 16px; height: 12px;
  background: linear-gradient(to bottom, rgba(255,220,150,0.18), rgba(255,200,120,0.08));
  border-radius: 3px;
`;

const glowPulse = keyframes`0%,100%{opacity:0.55} 50%{opacity:0.9}`;
const CandleGlow = styled.div`
  position: absolute; bottom: 8px; left: 0; right: 0; margin: auto;
  width: 60px; height: 60px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,160,0,0.18) 0%, transparent 70%);
  animation: ${glowPulse} 1.1s ease-in-out infinite;
  pointer-events: none;
`;

// --- Refua icon: glowing medical cross ---
const RefuaWrap = styled.div`position: relative; width: 44px; height: 44px; margin: 0 auto;`;
const RefuaGlow = styled.div`
  position: absolute; inset: -14px; border-radius: 50%;
  background: radial-gradient(circle, rgba(100,190,255,0.18) 0%, transparent 70%);
  animation: ${glowPulse} 1.4s ease-in-out infinite;
`;
const RefuaCross = styled.div`
  position: absolute; inset: 0;
  &::before { content:''; position:absolute; width:13px; height:44px; left:15.5px; top:0; background:rgba(130,200,255,0.85); border-radius:5px; }
  &::after  { content:''; position:absolute; width:44px; height:13px; left:0; top:15.5px; background:rgba(130,200,255,0.85); border-radius:5px; }
`;

// --- Hatzlaha icon: glowing 5-pointed star ---
const StarWrap = styled.div`position: relative; width: 46px; height: 46px; margin: 0 auto;`;
const StarGlow = styled.div`
  position: absolute; inset: -10px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%);
  animation: ${glowPulse} 1.2s ease-in-out infinite 0.1s;
`;
const Star = styled.div`
  position: absolute; inset: 0;
  background: rgba(255,215,50,0.9);
  clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
`;

// --- Zivug icon: two overlapping rings ---
const RingsWrap = styled.div`position: relative; width: 62px; height: 36px; margin: 0 auto;`;
const Ring1 = styled.div`
  position: absolute; width: 34px; height: 34px; top: 1px; left: 0;
  border: 3.5px solid rgba(255,215,80,0.85); border-radius: 50%;
  box-shadow: 0 0 12px rgba(255,215,0,0.28);
`;
const Ring2 = styled.div`
  position: absolute; width: 34px; height: 34px; top: 1px; left: 28px;
  border: 3.5px solid rgba(255,215,80,0.85); border-radius: 50%;
  box-shadow: 0 0 12px rgba(255,215,0,0.28);
`;

const DedType = styled.div`color: rgba(226,190,120,0.75); font-size: 0.85rem; letter-spacing: 0.14em; font-weight: 700;`;
const DedName = styled.div`
  color: #FFFDF6; font-family: var(--font-frank,serif);
  font-size: 1.7rem; font-weight: 700; line-height: 1.4;
  text-shadow: 0 2px 30px rgba(0,0,0,0.45);
`;

const DED_LABELS: Record<string, string> = {
  iluy: 'לעילוי נשמת', refua: 'לרפואת', hatzlaha: 'להצלחת', zivug: 'לזיווג',
};

export default function FeedDedication({ slide }: { slide: FeedDedicationSlide }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  const [amen, setAmen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold: 0.55 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const sayAmen = () => {
    if (amen) return;
    setAmen(true);
    haptics.success();
  };

  return (
    <DedSlide ref={ref}>
      <Reveal $v={v} $d="0s">
        {slide.dedType === 'iluy' ? (
          <CandleWrap>
            <CandleGlow />
            <Flame />
            <Wick />
            <CandleBase />
          </CandleWrap>
        ) : slide.dedType === 'refua' ? (
          <RefuaWrap><RefuaGlow /><RefuaCross /></RefuaWrap>
        ) : slide.dedType === 'hatzlaha' ? (
          <StarWrap><StarGlow /><Star /></StarWrap>
        ) : slide.dedType === 'zivug' ? (
          <RingsWrap><Ring1 /><Ring2 /></RingsWrap>
        ) : (
          <div style={{ fontSize: '2.4rem', marginBottom: 6 }}>🙏</div>
        )}
      </Reveal>
      <Reveal $v={v} $d="0.15s"><DedType>{DED_LABELS[slide.dedType] ?? slide.dedType}</DedType></Reveal>
      <Reveal $v={v} $d="0.3s"><DedName>{slide.name}</DedName></Reveal>
      <Reveal $v={v} $d="0.45s"><Orn>✦</Orn></Reveal>
      <Reveal $v={v} $d="0.6s">
        <AmenBtn $done={amen} onClick={sayAmen} aria-label={HE.FEED_AMEN_ARIA}>
          {amen ? `${HE.FEED_AMEN} ✓` : HE.FEED_AMEN}
        </AmenBtn>
      </Reveal>
    </DedSlide>
  );
}
