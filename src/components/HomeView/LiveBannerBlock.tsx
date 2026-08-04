'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { LiveSnapshot, LiveStream } from '@/types';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,80,80,0.6); }
  70%      { box-shadow: 0 0 0 8px rgba(255,80,80,0); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 6px 26px rgba(120,10,10,0.4), 0 0 0 1px rgba(255,120,120,0.35); }
  50%      { box-shadow: 0 10px 44px rgba(160,15,15,0.6), 0 0 0 1px rgba(255,150,150,0.55); }
`;

/* ---- Loud banner: at least one stream is on the air ---- */

const Banner = styled(Link)`
  width: 100%; position: relative; overflow: hidden;
  background:
    radial-gradient(ellipse at 85% 0%, rgba(255,120,90,0.25), transparent 55%),
    linear-gradient(140deg, #1c0b08 0%, #4a120e 45%, #7a1d15 80%, #a03325 100%);
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  text-align: center;
  animation: ${glow} 2.6s ease-in-out infinite;
  transition: transform 0.2s;
  &:hover  { transform: translateY(-3px) scale(1.005); }
  &:active { transform: scale(0.97); }
`;

const TitleRow = styled.div`
  display: flex; align-items: center; gap: 10px;
`;

const Dot = styled.span.attrs({ className: 'anim-loop' })`
  width: 12px; height: 12px; border-radius: 50%; background: #ff5a5a;
  animation: ${pulse} 1.5s ease-out infinite;
`;

const Title = styled.span`
  color: #fff; font-family: ${theme.fonts.body};
  font-size: 1.45rem; font-weight: 900; line-height: 1.15;
  text-shadow: 0 2px 14px rgba(0,0,0,0.45);
  @media (max-width: 480px) { font-size: 1.25rem; }
`;

const Thumbs = styled.div`
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
`;

const Thumb = styled.span`
  position: relative; display: block;
  width: 132px; aspect-ratio: 16 / 9;
  border-radius: ${theme.radii.md}; overflow: hidden;
  border: 2px solid rgba(255,255,255,0.55);
  box-shadow: 0 6px 18px rgba(0,0,0,0.45);
  @media (max-width: 480px) { width: 108px; }
`;

const ThumbImg = styled.img`
  width: 100%; height: 100%; object-fit: cover; display: block;
`;

const ThumbName = styled.span`
  position: absolute; inset: auto 0 0 0;
  background: linear-gradient(0deg, rgba(0,0,0,0.75), transparent);
  color: #fff; font-size: 0.58rem; font-weight: 700;
  padding: 8px 4px 3px; line-height: 1.2;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const Cta = styled.span`
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(180deg, #fff, #ffe3dc);
  color: #7a1d15; font-weight: 900; font-size: 0.9rem;
  padding: 7px 22px; border-radius: 999px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.8) inset;
  transition: transform 0.15s;
  ${Banner}:hover & { transform: scale(1.05); }
`;

/* ---- Quiet strip: nothing live right now ---- */

const Quiet = styled(Link)`
  width: 100%;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
  transition: transform ${theme.motion.fast} ease, box-shadow 0.18s;
  &:hover { transform: translateY(-2px); box-shadow: ${theme.shadows.md}; }
`;

const QuietIcon = styled.span`
  flex-shrink: 0; width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #b0433b; background: rgba(176,67,59,0.1);
  border: 1px solid rgba(176,67,59,0.3);
`;

const QuietText = styled.span`
  display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1;
`;

const QuietTitle = styled.span`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.md}; font-weight: 800; color: ${theme.colors.primary};
`;

const QuietSub = styled.span`
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
`;

const QuietArrow = styled.span`
  flex-shrink: 0; color: ${theme.colors.secondary}; font-weight: 800;
`;

export default function LiveBannerBlock() {
  const [streams, setStreams] = useState<LiveStream[]>([]);

  useEffect(() => {
    void fetch('/api/live')
      .then(r => r.json())
      .then((d: LiveSnapshot) => { if (Array.isArray(d.streams)) setStreams(d.streams); })
      .catch(() => {});
  }, []);

  if (streams.length === 0) {
    return (
      <Quiet href="/live">
        <QuietIcon><LineIcon name="live" size={20} /></QuietIcon>
        <QuietText>
          <QuietTitle>{HE.LIVE_HOME_QUIET_TITLE}</QuietTitle>
          <QuietSub>{HE.LIVE_HOME_QUIET_SUB}</QuietSub>
        </QuietText>
        <QuietArrow>←</QuietArrow>
      </Quiet>
    );
  }

  return (
    <Banner href="/live">
      <TitleRow>
        <Dot />
        <Title>{HE.LIVE_HOME_BANNER_TITLE}</Title>
      </TitleRow>
      <Thumbs>
        {streams.slice(0, 3).map(s => (
          <Thumb key={s.videoId}>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail */}
            <ThumbImg src={s.thumbnail} alt="" loading="lazy" />
            <ThumbName>{s.channelName}</ThumbName>
          </Thumb>
        ))}
      </Thumbs>
      <Cta>{HE.LIVE_HOME_BANNER_CTA} <span>←</span></Cta>
    </Banner>
  );
}
