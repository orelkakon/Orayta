'use client';

import { useContext, useState } from 'react';
import styled from 'styled-components';
import { HE } from '@/lib/hebrewTexts';
import { STORY_ART } from '@/lib/stories';
import type { StoryReel } from '@/types';
import { StoryPauseContext } from './ExpandableText';
import { PlayRing, PlayGlyph, TitleText, SubText, SourceChip } from './StoryCardParts';

const PlayButton = styled.button`
  position: relative; z-index: 3;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: transform 0.15s;
  &:hover { transform: scale(1.06); }
  &:active { transform: scale(0.92); }
`;

/* Same Instagram-embed crop the feed uses: oversize the iframe and shift it
   so the embed's header/footer chrome falls outside the 9:16 window. */
const VideoBox = styled.div`
  position: relative; z-index: 3;
  width: min(72vw, 290px);
  aspect-ratio: 9 / 16;
  border-radius: 14px; overflow: hidden; background: #000;
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.55);
`;

const CroppedFrame = styled.iframe`
  position: absolute; top: -54px; left: -21.15%;
  width: 142.3%; height: calc(100% + 60px);
  border: none; display: block; background: #000;
`;

/**
 * The random-video story: a play button first (so nothing loads until the
 * user asks), then the embedded reel playing inside the story itself. The
 * auto-advance timer holds while the player is open.
 */
export default function StoryVideo({ reel }: { reel: StoryReel }) {
  const setEngaged = useContext(StoryPauseContext);
  const [playing, setPlaying] = useState(false);
  const accent = STORY_ART.video.accent;

  if (playing) {
    return (
      <VideoBox>
        <CroppedFrame
          src={`https://www.instagram.com/reel/${reel.code}/embed/`}
          title={HE.STORY_LABELS.video}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          scrolling="no"
        />
      </VideoBox>
    );
  }

  return (
    <>
      <PlayButton onClick={() => { setPlaying(true); setEngaged(true); }} aria-label={HE.STORY_VIDEO_PLAY}>
        <PlayRing $accent={accent}><PlayGlyph /></PlayRing>
      </PlayButton>
      <TitleText>{HE.STORY_LABELS.video}</TitleText>
      <SubText>{HE.STORY_VIDEO_SUB}</SubText>
      {reel.username && <SourceChip>@{reel.username}</SourceChip>}
    </>
  );
}
