'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const glow = keyframes`
  0%, 100% { box-shadow: 0 6px 26px rgba(92,61,30,0.35), 0 0 0 1px rgba(214,175,110,0.35), 0 1px 0 rgba(255,225,170,0.2) inset; }
  50%       { box-shadow: 0 10px 44px rgba(92,61,30,0.55), 0 0 0 1px rgba(230,195,130,0.6), 0 1px 0 rgba(255,225,170,0.35) inset; }
`;

const shimmer = keyframes`
  0%   { transform: translateX(-120%) skewX(-18deg); }
  60%  { transform: translateX(220%) skewX(-18deg); }
  100% { transform: translateX(220%) skewX(-18deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50%       { transform: translateY(-7px); opacity: 1; }
`;

const nudge = keyframes`
  0%, 100% { transform: translateX(0); }
  50%       { transform: translateX(-5px); }
`;

const Banner = styled(Link)`
  width: 100%; position: relative; overflow: hidden;
  background:
    radial-gradient(ellipse at 85% 0%, rgba(255,215,150,0.18), transparent 55%),
    linear-gradient(140deg, #3d2513 0%, ${theme.colors.primary} 40%, #8a5a2e 78%, #b07c42 100%);
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  text-align: center;
  animation: ${glow} 3s ease-in-out infinite;
  transition: transform 0.2s;
  &:hover  { transform: translateY(-3px) scale(1.005); }
  &:active { transform: scale(0.97); }
  @media (max-width: 480px) { padding: ${theme.spacing.md} ${theme.spacing.md}; }
`;

/* moving band of light sweeping across the banner */
const Sheen = styled.div.attrs({ className: 'anim-loop' })`
  position: absolute; top: 0; bottom: 0; width: 45%; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,235,190,0.13), transparent);
  animation: ${shimmer} 3.6s ease-in-out infinite;
`;

const Spark = styled.span.attrs({ className: 'anim-loop' })<{ $top: string; $side: string; $delay: string; $size: string }>`
  position: absolute; top: ${p => p.$top}; right: ${p => p.$side};
  font-size: ${p => p.$size}; color: rgba(255,225,170,0.8); pointer-events: none;
  animation: ${float} 2.8s ease-in-out ${p => p.$delay} infinite;
  text-shadow: 0 0 10px rgba(255,215,150,0.7);
`;

const Title = styled.div`
  color: white; font-family: ${theme.fonts.body};
  font-size: 1.7rem; font-weight: 900; line-height: 1.15;
  text-shadow: 0 2px 14px rgba(0,0,0,0.35);
  background: linear-gradient(180deg, #fff 55%, #f3d9a8 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  @media (max-width: 480px) { font-size: 1.5rem; }
`;

/* Fanned story-cards with a play button — says "short video feed" at a glance */
const CardsGlyph = styled.span`
  display: inline-flex; line-height: 0;
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.35));
  transition: transform 0.2s ${theme.motion.spring};
  ${Banner}:hover & { transform: translateY(-3px) scale(1.06); }
`;

function FeedCardsIllustration() {
  return (
    <svg width="58" height="44" viewBox="0 0 58 44" fill="none" aria-hidden="true">
      <rect x="6" y="5" width="20" height="32" rx="4" transform="rotate(-10 16 21)"
        fill="rgba(255,235,190,0.28)" stroke="rgba(255,235,190,0.75)" strokeWidth="1.4" />
      <rect x="32" y="5" width="20" height="32" rx="4" transform="rotate(10 42 21)"
        fill="rgba(255,235,190,0.28)" stroke="rgba(255,235,190,0.75)" strokeWidth="1.4" />
      <rect x="19" y="2" width="21" height="37" rx="4.5"
        fill="rgba(61,37,19,0.85)" stroke="#ffe9c4" strokeWidth="1.6" />
      <circle cx="29.5" cy="20.5" r="7.5" fill="rgba(255,235,190,0.95)" />
      <path d="M27.2 16.8v7.4l6-3.7z" fill="#3d2513" />
    </svg>
  );
}

const Tagline = styled.div`
  color: #ffe9c4; font-family: ${theme.fonts.body};
  font-size: 0.95rem; font-weight: 700; letter-spacing: 0.02em;
  text-shadow: 0 1px 8px rgba(0,0,0,0.3);
`;

const Cta = styled.div`
  margin-top: 3px;
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(180deg, #fff, #f5e7cf);
  color: ${theme.colors.primary}; font-weight: 900; font-size: 0.9rem;
  padding: 7px 22px; border-radius: 999px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.8) inset;
  transition: transform 0.15s, box-shadow 0.15s;
  ${Banner}:hover & { transform: scale(1.05); box-shadow: 0 6px 22px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.8) inset; }
`;

const CtaArrow = styled.span.attrs({ className: 'anim-loop' })`
  display: inline-block; animation: ${nudge} 1.4s ease-in-out infinite;
`;

export default function FeedBannerBlock() {
  return (
    <Banner href="/feed">
      <Sheen />
      <Spark $top="14%" $side="8%"  $delay="0s"    $size="0.9rem">✦</Spark>
      <Spark $top="62%" $side="14%" $delay="0.9s"  $size="0.65rem">✦</Spark>
      <Spark $top="24%" $side="86%" $delay="0.5s"  $size="0.75rem">✦</Spark>
      <Spark $top="70%" $side="90%" $delay="1.4s"  $size="0.9rem">✦</Spark>
      <CardsGlyph><FeedCardsIllustration /></CardsGlyph>
      <Title>✨ {HE.FEED_TITLE}</Title>
      <Tagline>{HE.FEED_BANNER_TAGLINE}</Tagline>
      <Cta>
        {HE.FEED_BANNER_CTA}
        <CtaArrow>←</CtaArrow>
      </Cta>
    </Banner>
  );
}
