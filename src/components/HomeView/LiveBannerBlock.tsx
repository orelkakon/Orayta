'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { LiveSnapshot, LiveStream } from '@/types';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,90,90,0.6); }
  70%      { box-shadow: 0 0 0 7px rgba(255,90,90,0); }
`;

/* ---- Live: one slim CTA strip — no title block, no thumbnails ---- */

const LiveStrip = styled(Link)`
  width: 100%;
  display: flex; align-items: center; justify-content: center;
  gap: ${theme.spacing.sm};
  background: linear-gradient(140deg, #4a120e 0%, #7a1d15 60%, #a03325 100%);
  border-radius: ${theme.radii.lg};
  padding: 10px ${theme.spacing.md};
  box-shadow: 0 4px 18px rgba(120,10,10,0.35), 0 0 0 1px rgba(255,120,120,0.3);
  transition: transform ${theme.motion.fast} ease, box-shadow 0.2s;
  &:hover  { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(120,10,10,0.5), 0 0 0 1px rgba(255,150,150,0.5); }
  &:active { transform: scale(0.98); }
`;

const Dot = styled.span.attrs({ className: 'anim-loop' })`
  flex-shrink: 0; width: 10px; height: 10px; border-radius: 50%;
  background: #ff5a5a;
  animation: ${pulse} 1.5s ease-out infinite;
`;

const StripText = styled.span`
  color: #fff; font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.md}; font-weight: 900;
  text-shadow: 0 1px 8px rgba(0,0,0,0.35);
`;

const StripName = styled.span`
  color: #ffd9d0; font-size: ${theme.fontSizes.xs}; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 34%;
  @media (max-width: 480px) { display: none; }
`;

const StripArrow = styled.span`
  color: #fff; font-weight: 900;
  transition: transform 0.2s ease;
  ${LiveStrip}:hover & { transform: translateX(-4px); }
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
  flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #b0433b; background: rgba(176,67,59,0.1);
  border: 1px solid rgba(176,67,59,0.3);
`;

const QuietText = styled.span`
  display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1;
`;

const QuietTitle = styled.span`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.sm}; font-weight: 800; color: ${theme.colors.primary};
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
        <QuietIcon><LineIcon name="live" size={18} /></QuietIcon>
        <QuietText>
          <QuietTitle>{HE.LIVE_HOME_QUIET_TITLE}</QuietTitle>
          <QuietSub>{HE.LIVE_HOME_QUIET_SUB}</QuietSub>
        </QuietText>
        <QuietArrow>←</QuietArrow>
      </Quiet>
    );
  }

  return (
    <LiveStrip href="/live">
      <Dot />
      <StripText>{HE.LIVE_HOME_BANNER_CTA}</StripText>
      <StripName>{streams[0].channelName}</StripName>
      <StripArrow>←</StripArrow>
    </LiveStrip>
  );
}
