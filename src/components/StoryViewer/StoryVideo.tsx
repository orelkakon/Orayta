'use client';

import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { HE } from '@/lib/hebrewTexts';
import type { StoryReel } from '@/types';
import { StoryPauseContext } from './ExpandableText';
import { SourceChip } from './StoryCardParts';

/* Same Instagram-embed crop the feed uses: oversize the iframe and shift it
   so the embed's header/footer chrome falls outside the 9:16 window. */
const VideoBox = styled.div`
  position: relative; z-index: 3;
  width: min(72vw, 300px);
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
 * The random-video story: the reel is embedded immediately with the video
 * visible — one tap on its own play button starts it. The auto-advance
 * timer is held for this story so playback is never cut off.
 */
export default function StoryVideo({ reel }: { reel: StoryReel }) {
  const setEngaged = useContext(StoryPauseContext);
  useEffect(() => { setEngaged(true); }, [setEngaged]);

  return (
    <>
      <VideoBox>
        <CroppedFrame
          src={`https://www.instagram.com/reel/${reel.code}/embed/`}
          title={HE.STORY_LABELS.video}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          scrolling="no"
        />
      </VideoBox>
      {reel.username && <SourceChip>@{reel.username}</SourceChip>}
    </>
  );
}
