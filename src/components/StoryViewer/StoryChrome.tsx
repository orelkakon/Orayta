'use client';

import { RefObject } from 'react';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import StoryProgress from './StoryProgress';
import type { StoryCta } from './storyCards';

/* Scrims own no pointer events — taps fall through to the gesture layer;
   only the actual buttons re-enable them. */
const Top = styled.div`
  position: absolute; top: 0; left: 0; right: 0; z-index: 3;
  display: flex; flex-direction: column; gap: 10px;
  padding: calc(${theme.spacing.md} + env(safe-area-inset-top)) ${theme.spacing.md} ${theme.spacing.xl};
  background: linear-gradient(180deg, rgba(10, 6, 2, 0.6), transparent);
  pointer-events: none;
`;

const HeadRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`;

const Ident = styled.span`
  display: inline-flex; align-items: center; gap: 8px;
  color: #fdf6e6; font-weight: 700; font-size: 0.85rem;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
`;

const IdentDot = styled.span`
  width: 22px; height: 22px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: linear-gradient(145deg, #f3d692, #c4956a);
  color: #3c2711;
  font-family: ${theme.fonts.body}; font-weight: 800; font-size: 0.8rem;
`;

const IdentLabel = styled.span`
  opacity: 0.85; font-weight: 500;
`;

const CloseBtn = styled.button`
  pointer-events: auto;
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fdf6e6; background: rgba(255, 255, 255, 0.12);
  transition: background ${theme.motion.fast}, transform ${theme.motion.fast};
  &:hover { background: rgba(255, 255, 255, 0.22); }
  &:active { transform: scale(0.9); }
`;

const Bottom = styled.div`
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
  display: flex; align-items: center; justify-content: center; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.xl} ${theme.spacing.md} calc(${theme.spacing.lg} + env(safe-area-inset-bottom));
  background: linear-gradient(0deg, rgba(10, 6, 2, 0.6), transparent);
  pointer-events: none;
`;

const ctaStyle = css`
  pointer-events: auto;
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(180deg, #ffffff, #f5e7cf);
  color: #4a2f15; font-weight: 900; font-size: 0.92rem;
  padding: 10px 26px; border-radius: 999px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.8) inset;
  transition: transform ${theme.motion.fast} ${theme.motion.spring};
  &:hover { transform: scale(1.05); }
  &:active { transform: scale(0.94); }
`;

const CtaLink = styled(Link)`${ctaStyle}`;
const CtaAnchor = styled.a`${ctaStyle}`;

const ShareBtn = styled.button`
  pointer-events: auto;
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fdf6e6;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  transition: background ${theme.motion.fast}, transform ${theme.motion.fast};
  &:hover { background: rgba(255, 255, 255, 0.24); }
  &:active { transform: scale(0.9); }
  &:disabled { opacity: 0.5; }
`;

function CloseGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

function ShareGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

interface StoryChromeProps {
  count: number;
  current: number;
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
  count, current, barRef, closeRef, label, cta, canShare, sharing, onShare, onClose,
}: StoryChromeProps) {
  return (
    <>
      <Top>
        <StoryProgress count={count} current={current} ref={barRef} />
        <HeadRow>
          <Ident>
            <IdentDot aria-hidden="true">{HE.APP_NAME.charAt(0)}</IdentDot>
            {HE.APP_NAME}
            <IdentLabel>· {label}</IdentLabel>
          </Ident>
          <CloseBtn ref={closeRef} onClick={onClose} aria-label={HE.STORIES_CLOSE}>
            <CloseGlyph />
          </CloseBtn>
        </HeadRow>
      </Top>
      <Bottom>
        {canShare && (
          <ShareBtn onClick={onShare} disabled={sharing} aria-label={HE.STORY_SHARE_BTN}>
            <ShareGlyph />
          </ShareBtn>
        )}
        {cta && (cta.external
          ? <CtaAnchor href={cta.href} target="_blank" rel="noopener noreferrer">{cta.label} <span>←</span></CtaAnchor>
          : <CtaLink href={cta.href}>{cta.label} <span>←</span></CtaLink>)}
      </Bottom>
    </>
  );
}
