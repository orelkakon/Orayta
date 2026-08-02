'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { HE } from '@/lib/hebrewTexts';
import { FEED_GOLD } from './feedTypes';

const Overlay = styled.div<{ $leaving: boolean }>`
  position: fixed; inset: 0; z-index: 940;
  background: radial-gradient(120% 90% at 50% 8%, #12142E 0%, #07060D 62%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; text-align: center; padding: 24px;
  opacity: ${p => p.$leaving ? 0 : 1};
  transition: opacity 0.7s ease;
  pointer-events: ${p => p.$leaving ? 'none' : 'auto'};
`;

const breathe = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50%      { transform: scale(1.16); opacity: 1; }
`;

const Spark = styled.div`
  color: rgba(${FEED_GOLD}, 0.95); font-size: 1.9rem; line-height: 1;
  text-shadow: 0 0 22px rgba(${FEED_GOLD}, 0.65), 0 0 60px rgba(${FEED_GOLD}, 0.3);
  animation: ${breathe} 2.2s ease-in-out infinite;
`;

const Greeting = styled.div`
  color: rgba(255, 250, 240, 0.55); font-size: 0.95rem; letter-spacing: 0.06em;
`;

const Title = styled.div`
  font-family: var(--font-frank, serif); font-size: 2.15rem; font-weight: 800; line-height: 1.2;
  background: linear-gradient(180deg, #FFF7E2 20%, rgba(${FEED_GOLD}, 0.85) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`;

const Orn = styled.div`
  display: flex; align-items: center; gap: 10px;
  color: rgba(${FEED_GOLD}, 0.6); font-size: 0.6rem; line-height: 1;
  &::before, &::after {
    content: ''; width: 46px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(${FEED_GOLD}, 0.5));
  }
  &::after { background: linear-gradient(270deg, transparent, rgba(${FEED_GOLD}, 0.5)); }
`;

const Tagline = styled.div`color: rgba(255, 250, 240, 0.42); font-size: 0.85rem;`;

const HebDate = styled.div`
  font-family: var(--font-frank, serif);
  color: rgba(${FEED_GOLD}, 0.75); font-size: 0.92rem;
`;

const Streak = styled.div`
  margin-top: 8px; color: rgba(${FEED_GOLD}, 0.92); font-size: 0.8rem; font-weight: 700;
  background: rgba(${FEED_GOLD}, 0.08); border: 1px solid rgba(${FEED_GOLD}, 0.3);
  border-radius: 999px; padding: 6px 16px;
`;

const Back = styled(Link)`
  position: absolute; top: calc(14px + env(safe-area-inset-top)); right: 14px;
  color: rgba(255, 255, 255, 0.6); font-size: 0.82rem; font-weight: 700;
  background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 999px; padding: 6px 14px;
`;

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return HE.FEED_GREETING_MORNING;
  if (h >= 12 && h < 17) return HE.FEED_GREETING_NOON;
  if (h >= 17 && h < 22) return HE.FEED_GREETING_EVENING;
  return HE.FEED_GREETING_NIGHT;
}

function hebrewDate(): string {
  try {
    return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long' })
      .format(new Date());
  } catch {
    return '';
  }
}

interface Props {
  ready: boolean;
  streak: number;
}

// Atmospheric entry moment: greets by time of day while the first page loads,
// holds for a beat so the entrance feels intentional, then fades into the feed.
export default function FeedSplash({ ready, streak }: Props) {
  const [minWait, setMinWait] = useState(false);
  const [gone, setGone] = useState(false);
  const [hello] = useState(() => greeting());
  const [heb, setHeb] = useState('');

  // Client-only: the Hebrew calendar date is a hydration hazard on SSR.
  useEffect(() => { setHeb(hebrewDate()); }, []);

  useEffect(() => {
    const t = setTimeout(() => setMinWait(true), 950);
    return () => clearTimeout(t);
  }, []);

  const leaving = ready && minWait;

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setGone(true), 800);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;

  return (
    <Overlay $leaving={leaving} aria-hidden={leaving}>
      <Back href="/">{HE.FEED_BACK}</Back>
      <Spark>✦</Spark>
      <Greeting>{hello}</Greeting>
      <Title>{HE.FEED_TITLE}</Title>
      {heb && <HebDate>{heb}</HebDate>}
      <Orn>✦</Orn>
      <Tagline>{HE.FEED_SPLASH_TAGLINE}</Tagline>
      {streak >= 2
        ? <Streak>🔥 {streak} {HE.FEED_STREAK_DAYS}</Streak>
        : <Streak>{HE.FEED_STREAK_DAY1}</Streak>}
    </Overlay>
  );
}
