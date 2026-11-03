'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import IconButton from '@/components/ui/IconButton';

/** Prev/next buttons beside the stage on wide screens (phones tap and swipe). */
const Side = styled.div<{ $end: boolean }>`
  display: none;
  ${theme.up.sm} {
    display: block; position: absolute; top: 50%; transform: translateY(-50%);
    ${p => (p.$end ? 'left' : 'right')}: max(16px, calc(50% - 220px - 76px));
  }
`;

interface Props { canPrev: boolean; onPrev: () => void; onNext: () => void }

export default function StoryDesktopNav({ canPrev, onPrev, onNext }: Props) {
  return (
    <>
      <Side $end={false}>
        <IconButton $variant="glass" $size="lg" onClick={onPrev} disabled={!canPrev} aria-label={HE.STORIES_PREV}>
          <LineIcon name="chevronBack" size={24} strokeWidth={2} />
        </IconButton>
      </Side>
      <Side $end>
        <IconButton $variant="glass" $size="lg" onClick={onNext} aria-label={HE.STORIES_NEXT}>
          <LineIcon name="chevron" size={24} strokeWidth={2} />
        </IconButton>
      </Side>
    </>
  );
}
