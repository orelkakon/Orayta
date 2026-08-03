'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MainText, CREAM } from './StoryCardParts';

/**
 * Cards report "the user is engaged here" (reading full text, playing a
 * video, answering the quiz) so the viewer can hold the auto-advance timer.
 * Provided by StoryViewer; resets on every story change.
 */
export const StoryPauseContext = createContext<(engaged: boolean) => void>(() => {});

/* Interactive pieces inside a card must sit above the gesture layer (z 2). */
const FullText = styled.p<{ $size?: string }>`
  position: relative; z-index: 3;
  font-family: ${theme.fonts.body};
  font-size: ${p => p.$size ?? '1.05rem'};
  line-height: 1.8; color: ${CREAM};
  max-height: 46vh; overflow-y: auto;
  touch-action: pan-y; -webkit-overflow-scrolling: touch;
  padding: 0 2px;
`;

const MoreBtn = styled.button`
  position: relative; z-index: 3;
  font-size: 0.8rem; font-weight: 700; color: #f3d692;
  border: 1px solid rgba(243, 214, 146, 0.5);
  padding: 5px 18px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  transition: background ${theme.motion.fast}, transform ${theme.motion.fast};
  &:hover { background: rgba(255, 255, 255, 0.14); }
  &:active { transform: scale(0.94); }
`;

interface ExpandableTextProps {
  text: string;
  clamp?: number;
  size?: string;
}

/**
 * Clamped story text that offers "קרא עוד" only when something is actually
 * cut off. Expanding pauses the story and turns the text into its own
 * scrollable area.
 */
export function ExpandableText({ text, clamp = 9, size }: ExpandableTextProps) {
  const setEngaged = useContext(StoryPauseContext);
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setClipped(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  if (expanded) return <FullText $size={size}>{text}</FullText>;
  return (
    <>
      <MainText ref={ref} $clamp={clamp} $size={size}>{text}</MainText>
      {clipped && (
        <MoreBtn onClick={() => { setExpanded(true); setEngaged(true); }}>
          {HE.STORY_READ_MORE}
        </MoreBtn>
      )}
    </>
  );
}
