'use client';

import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { StoryPauseContext } from './ExpandableText';
import { Shell, Body } from './StoryCardParts';
import { StoryCardBody } from './storyCards';
import StoryScene from './StoryScene';
import type { DailyStory } from '@/types';

/**
 * One story card. Inside a group the next card cross-fades in; moving to
 * another group slides it in from the reading direction (RTL: forward comes
 * from the left), like flipping to the next "account".
 */
export type CardDirection = 'none' | 'forward' | 'back';

const fade = keyframes`from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: none; }`;
const fromLeft = keyframes`from { opacity: 0.4; transform: translateX(-28%); } to { opacity: 1; transform: none; }`;
const fromRight = keyframes`from { opacity: 0.4; transform: translateX(28%); } to { opacity: 1; transform: none; }`;

const Layer = styled.div<{ $dir: CardDirection }>`
  position: absolute; inset: 0;
  ${p => (p.$dir === 'none'
    ? css`animation: ${fade} 0.26s ${theme.motion.outStrong};`
    : css`animation: ${p.$dir === 'forward' ? fromLeft : fromRight} 0.34s ${theme.motion.drawer};`)}
`;

interface Props {
  story: DailyStory;
  art: { from: string; to: string; accent: string };
  dir: CardDirection;
  onEngaged: (engaged: boolean) => void;
}

export default function StoryCard({ story, art, dir, onEngaged }: Props) {
  return (
    <Layer $dir={dir}>
      <Shell $from={art.from} $to={art.to} $accent={art.accent}>
        <StoryScene storyKey={story.key} />
        <Body>
          <StoryPauseContext.Provider value={onEngaged}>
            <StoryCardBody story={story} />
          </StoryPauseContext.Provider>
        </Body>
      </Shell>
    </Layer>
  );
}
