'use client';

import { RefObject } from 'react';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import IconButton from '@/components/ui/IconButton';
import StoryProgress from './StoryProgress';
import type { StoryCta } from './storyCards';

/* Scrims own no pointer events — taps fall through to the gesture layer;
   only the actual buttons re-enable them. While a story is held the chrome
   fades away so the card can be read clean. */
const fadeable = css<{ $hidden: boolean }>`
  opacity: ${p => (p.$hidden ? 0 : 1)};
  transition: opacity 0.2s ease;
`;

const Top = styled.div<{ $hidden: boolean }>`
  position: absolute; top: 0; left: 0; right: 0; z-index: 3;
  display: flex; flex-direction: column; gap: 10px;
  padding: calc(10px + ${theme.safe.top}) 12px ${theme.spacing.xl};
  background: linear-gradient(180deg, ${theme.onMedia.shade}, transparent);
  pointer-events: none;
  ${fadeable}
`;

const HeadRow = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 8px;`;

const Ident = styled.span`
  display: inline-flex; align-items: center; gap: 8px; min-width: 0;
  color: ${theme.onMedia.ink}; font-weight: 700; font-size: ${theme.fontSizes.sm};
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
  & > span:last-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; opacity: 0.9; }
`;

const IdentDot = styled.span`
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: ${theme.gilded.fill}; color: ${theme.gilded.ink};
  font-family: ${theme.fonts.body}; font-weight: 700; font-size: 0.85rem;
`;

const Close = styled(IconButton)`pointer-events: auto;`;

const Bottom = styled.div<{ $hidden: boolean }>`
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
  display: flex; align-items: center; justify-content: center; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.xl} ${theme.spacing.md} calc(${theme.spacing.lg} + ${theme.safe.bottom});
  background: linear-gradient(0deg, ${theme.onMedia.shade}, transparent);
  pointer-events: none;
  ${fadeable}
`;

const ctaStyle = css`
  pointer-events: auto;
  display: inline-flex; align-items: center; gap: 8px; min-height: 48px;
  padding: 0 24px; border-radius: ${theme.radii.pill};
  background: ${theme.gilded.fill}; color: ${theme.gilded.ink};
  font-weight: 800; font-size: ${theme.fontSizes.md};
  box-shadow: 0 1px 0 ${theme.gilded.edge} inset, 0 8px 20px -8px rgba(0, 0, 0, 0.5);
  transition: transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.96); }
`;

const CtaLink = styled(Link)`${ctaStyle}`;
const CtaAnchor = styled.a`${ctaStyle}`;
const Share = styled(IconButton)`pointer-events: auto;`;

interface StoryChromeProps {
  count: number;
  current: number;
  hidden: boolean;
  barRef: RefObject<HTMLDivElement>;
  closeRef: RefObject<HTMLButtonElement>;
  label: string;
  cta: StoryCta | null;
  canShare: boolean;
  sharing: boolean;
  onShare: () => void;
  onClose: () => void;
}

export default function StoryChrome({
  count, current, hidden, barRef, closeRef, label, cta, canShare, sharing, onShare, onClose,
}: StoryChromeProps) {
  const ctaBody = cta && <>{cta.label}<LineIcon name="chevron" size={18} strokeWidth={2.2} /></>;
  return (
    <>
      <Top $hidden={hidden}>
        <StoryProgress count={count} current={current} ref={barRef} />
        <HeadRow>
          <Ident>
            <IdentDot aria-hidden="true">{HE.APP_NAME.charAt(0)}</IdentDot>
            <span>{label}</span>
          </Ident>
          <Close ref={closeRef} $variant="glass" onClick={onClose} aria-label={HE.STORIES_CLOSE}>
            <LineIcon name="close" size={20} strokeWidth={2.2} />
          </Close>
        </HeadRow>
      </Top>
      <Bottom $hidden={hidden}>
        {canShare && (
          <Share $variant="glass" onClick={onShare} disabled={sharing} aria-label={HE.STORY_SHARE_BTN}>
            <LineIcon name="share" size={20} strokeWidth={2} />
          </Share>
        )}
        {cta && (cta.external
          ? <CtaAnchor href={cta.href} target="_blank" rel="noopener noreferrer">{ctaBody}</CtaAnchor>
          : <CtaLink href={cta.href}>{ctaBody}</CtaLink>)}
      </Bottom>
    </>
  );
}
