'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { STORY_ART } from '@/lib/stories';
import type { StoryKey } from '@/types';

const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
`;
const breathe = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--ring), 0.38); }
  50%      { box-shadow: 0 0 0 7px rgba(var(--ring), 0); }
`;

const Button = styled.button<{ $index: number }>`
  display: flex; flex-direction: column; align-items: center; gap: 7px;
  width: 82px; flex-shrink: 0;
  padding: 2px 0;
  animation: ${fadeUp} 0.4s ${theme.motion.out} both;
  animation-delay: ${({ $index }) => $index * 45}ms;
  transition: transform ${theme.motion.fast} ${theme.motion.spring};
  &:hover { transform: translateY(-2px); }
  &:active { transform: scale(0.92); }
`;

/* The ring lives on ::before so the artwork inside stays still. Viewed
   circles get this quiet static border. */
const Ring = styled.span`
  position: relative; display: block;
  width: 70px; height: 70px; border-radius: 50%;
  &::before {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: ${theme.colors.border};
  }
`;

/* Unread: rotating gold conic gradient + a soft breathing glow. anim-loop
   lets reduced-motion users get a static (but still golden) ring. */
const UnreadRing = styled(Ring).attrs({ className: 'anim-loop' })`
  animation: ${breathe} 2.6s ease-in-out infinite;
  &::before {
    background: conic-gradient(#f3d692, rgb(var(--ring)), #f3d692, rgb(var(--ring)), #f3d692);
    animation: ${spin} 3.4s linear infinite;
  }
`;

const Art = styled.span<{ $from: string; $to: string }>`
  position: absolute; inset: 3px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(160deg, ${p => p.$from}, ${p => p.$to});
  border: 2px solid ${theme.colors.background};
  overflow: hidden;
  color: #f8ecd4;
`;

const Photo = styled.img`
  width: 100%; height: 100%; object-fit: cover;
`;

const Label = styled.span<{ $viewed: boolean }>`
  font-family: ${theme.fonts.ui};
  font-size: 0.72rem; line-height: 1.25; text-align: center;
  max-width: 82px;
  font-weight: ${({ $viewed }) => $viewed ? 500 : 700};
  color: ${({ $viewed }) => $viewed ? theme.colors.textMuted : theme.colors.text};
`;

interface StoryCircleProps {
  storyKey: StoryKey;
  viewed: boolean;
  index: number;
  imageUrl?: string | null;
  onClick: () => void;
}

export default function StoryCircle({ storyKey, viewed, index, imageUrl, onClick }: StoryCircleProps) {
  const art = STORY_ART[storyKey];
  const label = HE.STORY_LABELS[storyKey];
  const RingComp = viewed ? Ring : UnreadRing;
  return (
    <Button
      $index={index}
      onClick={onClick}
      style={{ ['--ring' as string]: art.accent }}
      aria-label={`${label} — ${viewed ? HE.STORIES_SEEN : HE.STORIES_NEW}`}
    >
      <RingComp>
        <Art $from={art.from} $to={art.to}>
          {imageUrl
            ? <Photo src={imageUrl} alt="" loading="lazy" />
            : <LineIcon name={art.icon} size={28} />}
        </Art>
      </RingComp>
      <Label $viewed={viewed}>{label}</Label>
    </Button>
  );
}
