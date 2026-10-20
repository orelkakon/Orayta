'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { popIn, reduced } from './playStyles';

/** Portrait for "who's in the picture" — hides itself if the image fails. */
const Img = styled.img<{ $h: string }>`
  display: block;
  margin: 0 auto;
  max-height: ${({ $h }) => $h};
  max-width: 100%;
  border-radius: ${theme.radii.lg};
  border: 3px solid ${theme.game.glassLine};
  box-shadow: 0 14px 40px rgba(0,0,0,0.4);
  object-fit: cover;
  animation: ${popIn} 0.5s ${theme.motion.spring} both;
  ${reduced};
`;

export default function QuestionImage({ src, height }: { src: string; height: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  // External portraits of arbitrary hosts — next/image would need each domain whitelisted.
  // eslint-disable-next-line @next/next/no-img-element
  return <Img src={src} alt={HE.PLAY_IMAGE_ALT} $h={height} referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}
