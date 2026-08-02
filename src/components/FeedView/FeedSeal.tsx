'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import { markSealed } from '@/lib/feedDaily';
import { shareTextSmart, SITE_URL, RLM } from '@/lib/siteUrl';

const GOLD = '217,181,108';

const ringDraw = keyframes`
  from { stroke-dashoffset: 540; opacity: 0.3; }
  to   { stroke-dashoffset: 0; opacity: 1; }
`;
const rise = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
`;
const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
`;
const floatUp = keyframes`
  0%   { opacity: 0; transform: translateY(12px) scale(0.6); }
  25%  { opacity: 0.9; }
  100% { opacity: 0; transform: translateY(-90px) scale(1.1); }
`;
const nudge = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50%      { transform: translateY(5px); opacity: 0.9; }
`;

const Slide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 90px 24px 120px; text-align: center;
  background:
    radial-gradient(90% 55% at 50% 32%, rgba(${GOLD}, 0.13), transparent 62%),
    linear-gradient(170deg, #100D06 0%, #201809 52%, #0D0A05 100%);
`;

const Reveal = styled.div<{ $v: boolean; $d: string }>`
  opacity: ${p => (p.$v ? 1 : 0)};
  animation: ${p => (p.$v ? rise : 'none')} 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${p => p.$d} both;
`;

const Kicker = styled.div`
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.22em;
  color: rgba(${GOLD}, 0.9);
`;

const SealRing = styled.div<{ $v: boolean }>`
  position: relative; width: 148px; height: 148px;
  animation: ${breathe} 5s ease-in-out 1.4s infinite;
  svg { position: absolute; inset: 0; transform: rotate(-90deg); }
  circle {
    fill: none; stroke: rgba(${GOLD}, 0.9); stroke-width: 2.5;
    stroke-linecap: round; stroke-dasharray: 540;
    stroke-dashoffset: ${p => (p.$v ? 0 : 540)};
    animation: ${p => (p.$v ? ringDraw : 'none')} 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
  }
`;

const SealInner = styled.div`
  position: absolute; inset: 10px; border-radius: 50%;
  border: 1px solid rgba(${GOLD}, 0.3);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px;
  background: radial-gradient(circle, rgba(${GOLD}, 0.1), transparent 75%);
`;

const SealStar = styled.span`
  font-size: 1.7rem; color: rgba(${GOLD}, 0.95);
  text-shadow: 0 0 18px rgba(${GOLD}, 0.75);
`;

const SealDays = styled.span`
  font-family: var(--font-frank, serif); font-size: 0.85rem; font-weight: 700;
  color: rgba(255, 250, 235, 0.9);
`;

const Title = styled.h2`
  font-family: var(--font-frank, serif);
  font-size: clamp(1.5rem, 5.5vw, 2rem); font-weight: 800;
  color: #FFFDF6; line-height: 1.3; max-width: 21ch;
`;

const HebDate = styled.div`
  font-family: var(--font-frank, serif); font-size: 1rem;
  color: rgba(${GOLD}, 0.85);
`;

const Sub = styled.p`
  font-size: 0.95rem; color: rgba(255, 250, 235, 0.62); max-width: 30ch; line-height: 1.7;
`;

const Milestone = styled.div`
  font-family: var(--font-frank, serif); font-size: 1.15rem; font-weight: 700;
  color: rgba(${GOLD}, 1); text-shadow: 0 0 22px rgba(${GOLD}, 0.5);
`;

const Chips = styled.div`display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;`;

const Chip = styled.span`
  font-size: 0.78rem; font-weight: 600; color: rgba(255, 250, 235, 0.85);
  padding: 5px 13px; border-radius: 20px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(${GOLD}, 0.25);
`;

const ShareBtn = styled.button`
  margin-top: 6px;
  padding: 12px 30px; border-radius: 26px;
  font-size: 0.95rem; font-weight: 700; color: #1E1504;
  background: linear-gradient(135deg, rgba(${GOLD}, 0.95), #EDCB85);
  box-shadow: 0 6px 24px rgba(${GOLD}, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover { box-shadow: 0 8px 30px rgba(${GOLD}, 0.5); }
  &:active { transform: scale(0.95); }
`;

const Continue = styled.div`
  position: absolute; bottom: calc(34px + env(safe-area-inset-bottom));
  font-size: 0.75rem; color: rgba(255, 250, 235, 0.55);
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  animation: ${nudge} 2s ease-in-out infinite;
`;

const Particle = styled.span<{ $left: string; $delay: string; $size: string }>`
  position: absolute; bottom: 30%; left: ${p => p.$left};
  font-size: ${p => p.$size}; color: rgba(${GOLD}, 0.8); pointer-events: none;
  animation: ${floatUp} 3.4s ease-out ${p => p.$delay} infinite;
`;

const MILESTONES: Record<number, string> = {
  3: HE.FEED_SEAL_MILESTONE_3,
  7: HE.FEED_SEAL_MILESTONE_7,
  14: HE.FEED_SEAL_MILESTONE_14,
  30: HE.FEED_SEAL_MILESTONE_30,
  100: HE.FEED_SEAL_MILESTONE_100,
};

function hebrewDate(): string {
  try {
    return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date());
  } catch {
    return '';
  }
}

interface Props {
  days: number;
  best: number;
  viewed: number;
}

export default function FeedSeal({ days, best, viewed }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);

  // Reveal choreography + one-time "day sealed" side effects on arrival.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setV(true);
        markSealed();
        haptics.success();
        obs.disconnect();
      }
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const milestone = MILESTONES[days];
  const heb = hebrewDate();

  const share = () => {
    void shareTextSmart(`${RLM}${HE.FEED_SEAL_SHARE_TEXT(days)}\n${SITE_URL}`, HE.FEED_TITLE);
  };

  return (
    <Slide ref={ref}>
      {v && ['12%', '28%', '50%', '72%', '88%'].map((left, i) => (
        <Particle key={left} $left={left} $delay={`${i * 0.55}s`} $size={i % 2 ? '0.7rem' : '0.95rem'}>✦</Particle>
      ))}
      <Reveal $v={v} $d="0s"><Kicker>{HE.FEED_SEAL_KICKER}</Kicker></Reveal>
      <SealRing $v={v}>
        <svg viewBox="0 0 148 148"><circle cx="74" cy="74" r="70" /></svg>
        <SealInner>
          <SealStar>✦</SealStar>
          {days > 0 && <SealDays>{HE.FEED_SEAL_STREAK(days)}</SealDays>}
        </SealInner>
      </SealRing>
      <Reveal $v={v} $d="0.35s"><Title>{HE.FEED_SEAL_TITLE}</Title></Reveal>
      {heb && <Reveal $v={v} $d="0.45s"><HebDate>{heb}</HebDate></Reveal>}
      <Reveal $v={v} $d="0.55s">
        {milestone ? <Milestone>{milestone}</Milestone> : <Sub>{HE.FEED_SEAL_SUB}</Sub>}
      </Reveal>
      <Reveal $v={v} $d="0.7s">
        <Chips>
          <Chip>{HE.FEED_SEAL_MOMENTS(viewed)}</Chip>
          {best > days && <Chip>{HE.FEED_SEAL_BEST(best)}</Chip>}
        </Chips>
      </Reveal>
      <Reveal $v={v} $d="0.85s"><ShareBtn onClick={share}>{HE.FEED_SEAL_SHARE}</ShareBtn></Reveal>
      <Continue>{HE.FEED_SEAL_CONTINUE}<span>↓</span></Continue>
    </Slide>
  );
}
