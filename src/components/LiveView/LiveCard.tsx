'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { LiveStream } from '@/types';

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
`;

const Card = styled.button`
  display: flex; flex-direction: column; text-align: right;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  overflow: hidden; box-shadow: ${theme.shadows.sm};
  transition: transform ${theme.motion.fast} ease, box-shadow 0.18s;
  cursor: pointer;
  &:hover { transform: translateY(-4px); box-shadow: ${theme.shadows.lg}; }
  &:active { transform: scale(0.98); }
`;

const Thumb = styled.div`
  position: relative; width: 100%; aspect-ratio: 16 / 9;
  background: #000;
`;

const ThumbImg = styled.img`
  width: 100%; height: 100%; object-fit: cover; display: block;
`;

/* Soft dark ramp so the badge and play button read on bright thumbnails */
const ThumbShade = styled.div`
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.45) 100%);
`;

const Badge = styled.span.attrs({ className: 'anim-loop' })`
  position: absolute; top: 10px; right: 10px;
  display: inline-flex; align-items: center; gap: 5px;
  background: #dc2626; color: #fff;
  font-size: 0.68rem; font-weight: 900; letter-spacing: 0.14em;
  padding: 3px 9px; border-radius: 6px;
  box-shadow: 0 2px 10px rgba(220,38,38,0.5);
  &::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%; background: #fff;
    animation: ${blink} 1.2s ease-in-out infinite;
  }
`;

const PlayDisc = styled.span`
  position: absolute; inset: 0; margin: auto;
  width: 54px; height: 54px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.55); color: #fff;
  border: 2px solid rgba(255,255,255,0.85);
  transition: transform ${theme.motion.fast} ${theme.motion.spring}, background 0.18s;
  ${Card}:hover & { transform: scale(1.12); background: rgba(220,38,38,0.85); }
`;

const Meta = styled.div`
  display: flex; flex-direction: column; gap: 3px;
  padding: ${theme.spacing.ms} ${theme.spacing.md};
  width: 100%;
`;

const Channel = styled.span`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.md}; font-weight: 800; color: ${theme.colors.primary};
`;

const Title = styled.span`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;

interface Props {
  stream: LiveStream;
  onWatch: (stream: LiveStream) => void;
}

export default function LiveCard({ stream, onWatch }: Props) {
  return (
    <Card onClick={() => onWatch(stream)} aria-label={`${HE.LIVE_WATCH}: ${stream.channelName}`}>
      <Thumb>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, not an optimizable asset */}
        <ThumbImg src={stream.thumbnail} alt="" loading="lazy" />
        <ThumbShade />
        <Badge>{HE.LIVE_BADGE}</Badge>
        <PlayDisc><LineIcon name="play" size={22} filled /></PlayDisc>
      </Thumb>
      <Meta>
        <Channel>{stream.channelName}</Channel>
        <Title>{stream.title}</Title>
      </Meta>
    </Card>
  );
}
