'use client';

import styled, { keyframes } from 'styled-components';
import type { FeedDedicationSlide } from '@/types';

const DedSlide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: linear-gradient(160deg, #080610 0%, #10081a 50%, #080610 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 40px 32px; text-align: center;
  border-top: 1px solid rgba(200,170,100,0.08);
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

const DedType = styled.div`color: rgba(200,170,100,0.65); font-size: 0.85rem; letter-spacing: 0.06em;`;
const DedName = styled.div`
  color: rgba(255,255,255,0.92); font-family: var(--font-frank,serif);
  font-size: 1.6rem; font-weight: 700; line-height: 1.4;
`;

const DED_LABELS: Record<string, string> = {
  iluy: 'לעילוי נשמת', refua: 'לרפואת', hatzlaha: 'להצלחת', zivug: 'לזיווג',
};

export default function FeedDedication({ slide }: { slide: FeedDedicationSlide }) {
  return (
    <DedSlide>
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
      <DedType>{DED_LABELS[slide.dedType] ?? slide.dedType}</DedType>
      <DedName>{slide.name}</DedName>
    </DedSlide>
  );
}
