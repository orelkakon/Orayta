'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

/** Full-slide states for the feed: first load (skeleton), error, empty mix. */
const Slide = styled.div`
  height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: ${theme.spacing.md}; padding: calc(80px + ${theme.safe.top}) 32px calc(80px + ${theme.safe.bottom});
  text-align: center; color: ${theme.onMedia.ink};
  background: ${theme.game.stage};
`;

const Disc = styled.span`
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.game.goldLight}; background: ${theme.onMedia.glass}; border: 1px solid ${theme.onMedia.line};
`;

const Title = styled.h2`font-size: ${theme.fontSizes.xl}; color: ${theme.onMedia.ink};`;
const Sub = styled.p`max-width: 30ch; font-size: ${theme.fontSizes.sm}; color: ${theme.onMedia.muted}; line-height: 1.6;`;

const Lines = styled.div`
  width: min(320px, 80vw); display: flex; flex-direction: column; align-items: center; gap: 12px;
  & > span { background: ${theme.onMedia.glass}; }
`;

export function FeedLoadingSlide() {
  return (
    <Slide aria-busy="true" aria-label={HE.FEED_LOADING}>
      <Lines aria-hidden="true">
        <Skeleton $w="34%" $h="26px" $r="13px" />
        <Skeleton $w="100%" $h="16px" style={{ marginTop: 28 }} />
        <Skeleton $w="92%" $h="16px" />
        <Skeleton $w="96%" $h="16px" />
        <Skeleton $w="64%" $h="16px" />
      </Lines>
    </Slide>
  );
}

export function FeedErrorSlide({ onRetry }: { onRetry: () => void }) {
  return (
    <Slide role="alert">
      <Disc aria-hidden="true"><LineIcon name="refresh" size={28} strokeWidth={1.8} /></Disc>
      <Title>{HE.FEED_ERROR_TITLE}</Title>
      <Sub>{HE.FEED_ERROR_SUB}</Sub>
      <Button $variant="gold" onClick={onRetry}>{HE.FEED_RETRY}</Button>
    </Slide>
  );
}

export function FeedEmptySlide({ onSettings }: { onSettings: () => void }) {
  return (
    <Slide role="status">
      <Disc aria-hidden="true"><LineIcon name="sliders" size={28} strokeWidth={1.8} /></Disc>
      <Title>{HE.FEED_EMPTY_TITLE}</Title>
      <Sub>{HE.FEED_EMPTY_SUB}</Sub>
      <Button $variant="gold" onClick={onSettings}>{HE.FEED_EMPTY_CTA}</Button>
    </Slide>
  );
}
