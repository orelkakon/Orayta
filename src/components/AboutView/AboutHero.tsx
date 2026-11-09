'use client';

import { PointerEvent, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import HeroOrbit, { Embers } from './HeroOrbit';
import { useScrollVar } from './useScrollMotion';

const letterIn = keyframes`
  from { opacity: 0; transform: translateY(0.35em) scale(0.9); filter: blur(10px); }
  to { opacity: 1; transform: none; filter: blur(0); }
`;
const fadeUp = keyframes`from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; }`;
const draw = keyframes`to { stroke-dashoffset: 0; }`;
const bob = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); }`;

const G = theme.game;

const Stage = styled.section`
  position: relative; overflow: hidden; isolation: isolate;
  min-height: min(760px, calc(100svh - var(--header-h, 0px) - var(--tabbar-h, 0px) - 24px));
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: ${theme.spacing.md}; text-align: center;
  padding: ${theme.spacing.xxl} ${theme.spacing.lg} 88px;
  border-radius: 32px;
  background: ${G.stage}; color: ${G.ink};
  box-shadow: ${theme.gilded.nightShadow}, 0 0 0 1px ${theme.gilded.nightLine} inset;
  &::before {
    content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background: ${theme.gilded.nightGlow};
  }
  ${theme.media.sm} { border-radius: 26px; padding: ${theme.spacing.xl} ${theme.spacing.md} 80px; }
`;

const Copy = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm};
  transform: translateY(calc(var(--p, 0) * -50px)); opacity: calc(1 - var(--p, 0) * 1.1);
  @media (prefers-reduced-motion: reduce) { transform: none; opacity: 1; }
`;

const Kicker = styled.p<{ $d: number }>`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; letter-spacing: 0.06em; color: ${G.goldLight};
  animation: ${fadeUp} 0.8s ${theme.motion.outStrong} ${p => p.$d}ms both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Title = styled.h1`
  position: relative;
  font-family: ${theme.fonts.body}; font-weight: 900; line-height: 1;
  font-size: clamp(3.4rem, 2.4rem + 6vw, 5.6rem);
  color: ${G.goldInk};
  text-shadow: 0 0 40px rgba(226, 184, 107, 0.35);
  span {
    display: inline-block;
    animation: ${letterIn} 0.9s ${theme.motion.outStrong} both;
    @media (prefers-reduced-motion: reduce) { animation: none; }
  }
  svg { position: absolute; inset-inline: 6%; bottom: -14px; width: 88%; height: 18px; overflow: visible; }
  path { stroke-dasharray: 320; stroke-dashoffset: 320; animation: ${draw} 1.1s ${theme.motion.outStrong} 1.1s forwards; }
  @media (prefers-reduced-motion: reduce) { path { animation: none; stroke-dashoffset: 0; } }
`;

const Lead = styled(Kicker)`
  max-width: 28em; margin-top: ${theme.spacing.md};
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.2rem); font-weight: 500; letter-spacing: 0; line-height: 1.7;
  color: ${theme.gilded.nightMuted};
`;

const Verse = styled.figure<{ $d: number }>`
  display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: ${theme.spacing.sm};
  animation: ${fadeUp} 0.8s ${theme.motion.outStrong} ${p => p.$d}ms both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
  blockquote { font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${G.goldLight}; }
  figcaption { font-size: ${theme.fontSizes.xs}; color: ${G.inkFaint}; }
`;

const Cue = styled.a`
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  min-height: 44px; padding: 0 12px;
  font-size: ${theme.fontSizes.xs}; color: ${G.inkMuted};
  opacity: calc(1 - var(--p, 0) * 4);
  svg { animation: ${bob} 1.8s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { svg { animation: none; } }
`;

const NAME_DELAY = 350;

/** The opening stage: orbiting letters, the name written in, the verse, a scroll cue. */
export default function AboutHero() {
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, 0, 0);
  const name = Array.from(HE.APP_NAME);
  const after = NAME_DELAY + name.length * 90 + 300;

  // Fine pointers tilt the orbit toward the cursor.
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  return (
    <Stage ref={ref} onPointerMove={onMove} aria-labelledby="about-title">
      <Embers />
      <HeroOrbit />
      <Copy>
        <Kicker $d={150}>{HE.ABOUT_HERO_KICKER}</Kicker>
        <Title id="about-title" aria-label={HE.APP_NAME}>
          {name.map((l, i) => <span key={i} aria-hidden style={{ animationDelay: `${NAME_DELAY + i * 90}ms` }}>{l}</span>)}
          <svg viewBox="0 0 300 18" aria-hidden="true" preserveAspectRatio="none">
            <path d="M4 12 C 70 2, 120 16, 150 9 S 240 2, 296 10" fill="none" stroke={G.gold} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </Title>
        <Lead $d={after}>{HE.ABOUT_HERO_LEAD}</Lead>
        <Verse $d={after + 200}>
          <blockquote>&ldquo;{HE.ABOUT_VERSE}&rdquo;</blockquote>
          <figcaption>{HE.ABOUT_VERSE_SOURCE}</figcaption>
        </Verse>
      </Copy>
      <Cue href="#about-story">
        {HE.ABOUT_SCROLL_CUE}
        <LineIcon name="chevronDown" size={18} />
      </Cue>
    </Stage>
  );
}
