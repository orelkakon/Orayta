'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { enter } from './contactStyles';

const float = keyframes`0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-6px) rotate(-4deg); }`;
const rise = keyframes`0% { transform: translateY(26px); } 100% { transform: translateY(0); }`;
const twinkle = keyframes`0%, 100% { opacity: 0.2; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1); }`;

const Card = styled.header<{ $i?: number }>`
  ${enter}
  position: relative; overflow: hidden; isolation: isolate;
  display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl} ${theme.spacing.xl};
  border-radius: 28px;
  background: ${theme.gilded.night}; color: ${theme.gilded.nightInk};
  box-shadow: ${theme.gilded.nightShadow}, 0 0 0 1px ${theme.gilded.nightLine} inset;
  &::before { content: ''; position: absolute; inset: 0; z-index: -1; background: ${theme.gilded.nightGlow}; }
  ${theme.media.sm} { padding: ${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.lg}; border-radius: 24px; }
`;
const Kicker = styled.p`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.game.goldLight}; letter-spacing: 0.02em;`;
const Title = styled.h1`
  margin-top: 4px; font-family: ${theme.fonts.body}; font-weight: 800; line-height: 1.05;
  font-size: clamp(2.1rem, 1.6rem + 2.4vw, 3rem); color: ${theme.gilded.nightInk};
`;
const Lead = styled.p`
  margin-top: ${theme.spacing.ms}; max-width: 30em;
  font-size: ${theme.fontSizes.md}; line-height: 1.7; color: ${theme.gilded.nightMuted};
  ${theme.media.sm} { font-size: ${theme.fontSizes.sm}; }
`;

const Art = styled.svg`
  width: 128px; height: 116px; overflow: visible;
  ${theme.media.sm} { width: 88px; height: 80px; }
  .env { transform-box: fill-box; transform-origin: center; animation: ${float} 6s ease-in-out infinite; }
  .letter { animation: ${rise} 0.9s ${theme.motion.outStrong} 0.35s both; }
  .spark { transform-box: fill-box; transform-origin: center; animation: ${twinkle} 2.8s ease-in-out infinite; }
  .spark:nth-of-type(2) { animation-delay: 0.9s; }
  .spark:nth-of-type(3) { animation-delay: 1.7s; }
  @media (prefers-reduced-motion: reduce) { .env, .letter, .spark { animation: none; } }
`;

const G = theme.game;

/** Night-and-gold header with a floating envelope whose letter slides up once. */
export default function ContactHero() {
  return (
    <Card $i={0}>
      <div>
        <Kicker>{HE.CONTACT_KICKER}</Kicker>
        <Title>{HE.CONTACT_PAGE_TITLE}</Title>
        <Lead>{HE.CONTACT_LEAD}</Lead>
      </div>
      <Art viewBox="0 0 128 116" aria-hidden="true">
        <defs>
          <clipPath id="ct-env-clip"><rect x="14" y="10" width="100" height="94" /></clipPath>
        </defs>
        <g className="env">
          <g clipPath="url(#ct-env-clip)">
            <g className="letter">
              <rect x="30" y="22" width="68" height="66" rx="6" fill={G.goldInk} />
              <path d="M40 36h48M40 46h48M40 56h32" stroke={G.goldDeep} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
            </g>
          </g>
          <path d="M18 56l46 30 46-30v40a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8z" fill={G.gold} />
          <path d="M18 56l46 30 46-30" fill="none" stroke={G.goldDeep} strokeWidth="2" strokeLinejoin="round" />
          <path d="M18 100l34-24M110 100L76 76" stroke={G.goldDeep} strokeWidth="2" opacity="0.5" />
          <circle cx="64" cy="84" r="9" fill={G.answers[0]} stroke={G.goldInk} strokeWidth="1.5" />
          <path d="M60 84h8M64 80v8" stroke={G.goldInk} strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <path className="spark" d="M112 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={G.goldLight} />
        <path className="spark" d="M10 30l1.5 3.5 3.5 1.5-3.5 1.5L10 40l-1.5-3.5L5 35l3.5-1.5z" fill={G.goldLight} />
        <path className="spark" d="M120 64l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z" fill={G.goldLight} />
      </Art>
    </Card>
  );
}
