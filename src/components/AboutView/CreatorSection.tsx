'use client';

import { useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { ButtonLink, ButtonAnchor } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';
import { useInView } from './useScrollMotion';

const spin = keyframes`to { transform: rotate(360deg); }`;
const rise = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; }`;

const Card = styled.section<{ $shown: boolean }>`
  position: relative; overflow: hidden; isolation: isolate;
  width: 100%; max-width: 720px; margin: 0 auto;
  display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  border-radius: 28px;
  background: ${theme.gilded.night}; color: ${theme.gilded.nightInk};
  box-shadow: ${theme.gilded.nightShadow}, 0 0 0 1px ${theme.gilded.nightLine} inset;
  &::before { content: ''; position: absolute; inset: 0; z-index: -1; background: ${theme.gilded.nightGlow}; }
  ${theme.media.sm} { grid-template-columns: minmax(0, 1fr); justify-items: center; text-align: center; padding: ${theme.spacing.lg}; }
  ${p => (p.$shown ? css`animation: ${rise} 0.7s ${theme.motion.outStrong} both;` : css`opacity: 0;`)}
  @media (prefers-reduced-motion: reduce) { animation: none; opacity: 1; }
`;

const Avatar = styled.div`
  position: relative; width: 112px; height: 112px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  &::before {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: conic-gradient(from 0deg, ${theme.game.gold}, transparent 30%, ${theme.game.goldLight} 55%, transparent 80%, ${theme.game.gold});
    animation: ${spin} 8s linear infinite;
    @media (prefers-reduced-motion: reduce) { animation: none; }
  }
  span {
    position: relative; width: calc(100% - 6px); height: calc(100% - 6px); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 35% 30%, #5A3A1C, #23150A 75%);
    font-family: ${theme.fonts.body}; font-size: 2rem; font-weight: 800; color: ${theme.game.goldInk};
  }
`;

const Body = styled.div`display: flex; flex-direction: column; gap: 6px; min-width: 0;`;
const Kicker = styled.p`font-size: ${theme.fontSizes.xs}; font-weight: 800; letter-spacing: 0.08em; color: ${theme.game.goldLight};`;
const Name = styled.h2`font-family: ${theme.fonts.body}; font-size: clamp(1.7rem, 1.3rem + 1.6vw, 2.2rem); font-weight: 800; color: ${theme.gilded.nightInk};`;
const Line = styled.p`font-size: ${theme.fontSizes.md}; line-height: 1.7; color: ${theme.gilded.nightMuted};`;
const Links = styled.div`
  display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm}; margin-top: ${theme.spacing.sm};
  ${theme.media.sm} { justify-content: center; }
`;
const Ghost = styled(ButtonAnchor)`
  background: ${theme.gilded.nightGhost}; color: ${theme.gilded.nightInk}; border: 1px solid ${theme.gilded.nightLine};
  @media (hover: hover) and (pointer: fine) { &:hover { background: ${theme.gilded.nightGhostHi}; } }
`;

const LinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M6.5 9.5h-3v11h3v-11zM5 3.5a1.75 1.75 0 100 3.5 1.75 1.75 0 000-3.5zM20.5 20.5h-3v-5.4c0-1.4-.5-2.4-1.8-2.4-1 0-1.6.7-1.8 1.3-.1.2-.1.6-.1.9v5.6h-3s.04-9.1 0-11h3v1.6c.4-.6 1.1-1.5 2.7-1.5 2 0 3.5 1.3 3.5 4.1v6.8z" />
  </svg>
);

/** Who builds Orayta, and how to get in touch. */
export default function CreatorSection() {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref);
  return (
    <Card ref={ref} $shown={shown} aria-labelledby="about-creator">
      <Avatar aria-hidden><span>{HE.ABOUT_CREATOR_INITIALS}</span></Avatar>
      <Body>
        <Kicker>{HE.ABOUT_CREATOR_KICKER}</Kicker>
        <Name id="about-creator">{HE.ABOUT_CREATOR_NAME}</Name>
        <Line>{HE.ABOUT_CREATOR_LINE}</Line>
        <Links>
          <ButtonLink href="/contact" $variant="gold" $size="sm">
            <LineIcon name="send" size={16} />{HE.ABOUT_CREATOR_CONTACT}
          </ButtonLink>
          <Ghost href={`mailto:${HE.ABOUT_CREATOR_EMAIL}`} $size="sm" aria-label={HE.ABOUT_CREATOR_EMAIL}>
            <LineIcon name="comment" size={16} /><span dir="ltr">{HE.ABOUT_CREATOR_EMAIL}</span>
          </Ghost>
          <Ghost href="https://www.linkedin.com/in/orelkakon/" target="_blank" rel="noopener noreferrer" $size="sm">
            <LinkedIn />LinkedIn
          </Ghost>
        </Links>
      </Body>
    </Card>
  );
}
