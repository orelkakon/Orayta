'use client';

import { useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { LineIcon } from '@/components/common/LineIcons';
import { STORY_ART } from '@/lib/stories';
import type { StoryKey } from '@/types';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
`;

const Button = styled.button<{ $index: number }>`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  width: 76px; flex-shrink: 0;
  padding: 2px 0;
  animation: ${fadeUp} 0.35s ${theme.motion.outStrong} both;
  animation-delay: ${({ $index }) => Math.min($index, 8) * 35}ms;
  transition: transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.94); }
`;

/* The ring lives on ::before so the artwork inside stays still. Unread:
   a static gold → type-accent gradient (like Instagram's — motion would
   read as "loading"). Viewed: a quiet hairline. */
const Ring = styled.span`
  position: relative; display: block;
  width: 68px; height: 68px; border-radius: 50%;
  &::before {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: ${theme.colors.border};
  }
`;

const UnreadRing = styled(Ring)`
  &::before {
    background: linear-gradient(200deg, ${theme.game.goldLight} 0%, ${theme.game.gold} 45%, rgb(var(--ring)) 100%);
  }
`;

const Art = styled.span<{ $from: string; $to: string }>`
  position: absolute; inset: 2.5px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(160deg, ${p => p.$from}, ${p => p.$to});
  border: 2.5px solid ${theme.colors.background};
  overflow: hidden;
  color: ${theme.game.goldInk};
`;

const Photo = styled.img`
  width: 100%; height: 100%; object-fit: cover;
`;

const Label = styled.span<{ $viewed: boolean }>`
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.xxs}; line-height: 1.25; text-align: center;
  max-width: 76px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-weight: ${({ $viewed }) => $viewed ? 500 : 700};
  color: ${({ $viewed }) => $viewed ? theme.colors.textMuted : theme.colors.text};
`;

interface StoryCircleProps {
  /** The story whose artwork represents the circle (a group's next story). */
  storyKey: StoryKey;
  label: string;
  ariaLabel: string;
  viewed: boolean;
  index: number;
  groupId: string;
  imageUrl?: string | null;
  onOpen: (ring: DOMRect | null) => void;
}

export default function StoryCircle({ storyKey, label, ariaLabel, viewed, index, groupId, imageUrl, onOpen }: StoryCircleProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const ringRef = useRef<HTMLSpanElement>(null);
  const art = STORY_ART[storyKey];
  const RingComp = viewed ? Ring : UnreadRing;
  return (
    <Button
      $index={index}
      onClick={() => onOpen(ringRef.current?.getBoundingClientRect() ?? null)}
      style={{ ['--ring' as string]: art.accent }}
      aria-label={ariaLabel}
      data-story-group={groupId}
    >
      <RingComp ref={ringRef} data-story-ring="">
        <Art $from={art.from} $to={art.to}>
          {imageUrl && !imgFailed
            ? <Photo src={imageUrl} alt="" loading="lazy" onError={() => setImgFailed(true)} />
            : <LineIcon name={art.icon} size={26} />}
        </Art>
      </RingComp>
      <Label $viewed={viewed}>{label}</Label>
    </Button>
  );
}
