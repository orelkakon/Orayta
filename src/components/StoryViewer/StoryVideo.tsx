'use client';

import { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { StoryPauseContext } from './ExpandableText';
import { HE } from '@/lib/hebrewTexts';
import type { StoryReel } from '@/types';
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
 * visible — one tap on its own play button starts it, which also pauses the
 * story clock until the user moves on.
 */
export default function StoryVideo({ reel }: { reel: StoryReel }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const setEngaged = useContext(StoryPauseContext);

  // A tap inside the embed moves focus into the iframe (the page sees a
  // window blur) — that's the user starting the clip, so hold the clock.
  useEffect(() => {
    const onBlur = () => {
      window.setTimeout(() => {
        if (document.activeElement === frameRef.current) setEngaged(true);
      }, 0);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [setEngaged]);

  return (
    <>
      <VideoBox>
        <CroppedFrame
          ref={frameRef}
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
