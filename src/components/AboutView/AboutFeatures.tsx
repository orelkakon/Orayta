'use client';

import { PointerEvent, useRef } from 'react';
import Link from 'next/link';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { useInView } from './useScrollMotion';
import { Kicker } from './AboutManifesto';

const riseIn = keyframes`from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: none; }`;

const Wrap = styled.section`display: flex; flex-direction: column; gap: ${theme.spacing.md}; padding: ${theme.spacing.xl} 0;`;
const Title = styled.h2`
  font-family: ${theme.fonts.body}; font-weight: 800; color: ${theme.colors.primary};
  font-size: clamp(1.9rem, 1.4rem + 2.2vw, 2.8rem); line-height: 1.1;
`;

const Bento = styled.div`
  display: grid; gap: ${theme.spacing.ms}; margin-top: ${theme.spacing.sm};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  ${theme.up.md} { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: ${theme.spacing.md}; }
`;

const Tile = styled(Link)<{ $big: boolean; $shown: boolean; $i: number }>`
  --mx: 50%; --my: 0%;
  position: relative; overflow: hidden; isolation: isolate;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md}; border-radius: 22px; min-height: 150px;
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  color: ${theme.colors.text};
  grid-column: span ${p => (p.$big ? 2 : 1)};
  ${theme.up.md} { grid-column: span ${p => (p.$big ? 3 : 2)}; padding: ${theme.spacing.lg}; }
  /* The last tile closes the row on both grids. */
  &:last-child { grid-column: span 2; }
  /* Reveal: rise in a cascade once the grid enters the screen. */
  ${p => (p.$shown
    ? css`animation: ${riseIn} 0.6s ${theme.motion.outStrong} ${p.$i * 55}ms backwards;`
    : css`opacity: 0;`)}
  transition: transform 0.16s ${theme.motion.outStrong}, border-color 0.25s ease, box-shadow 0.25s ease;
  /* Spotlight that follows the pointer. */
  &::before {
    content: ''; position: absolute; inset: 0; z-index: -1; opacity: 0; transition: opacity 0.3s ease;
    background: radial-gradient(260px circle at var(--mx) var(--my), color-mix(in srgb, ${theme.colors.gold} 22%, transparent), transparent 70%);
  }
  @media (hover: hover) and (pointer: fine) {
    &:hover { border-color: color-mix(in srgb, ${theme.colors.gold} 55%, ${theme.colors.borderLight}); box-shadow: ${theme.shadows.md}; }
    &:hover::before { opacity: 1; }
    &:hover .chip { transform: rotate(-8deg) scale(1.08); }
    &:hover .go { opacity: 1; transform: none; }
  }
  &:active { transform: scale(0.98); }
  ${p => p.$big && css`
    background: ${theme.gilded.night}; color: ${theme.gilded.nightInk};
    border-color: ${theme.gilded.nightLine};
    h3 { color: ${theme.game.goldInk}; }
    p { color: ${theme.gilded.nightMuted}; }
    .chip { background: ${theme.gilded.fill}; color: ${theme.gilded.ink}; }
  `}
  @media (prefers-reduced-motion: reduce) { opacity: 1; animation: none; }
`;

const Chip = styled.span`
  width: 48px; height: 48px; border-radius: 15px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary};
  background: color-mix(in srgb, ${theme.colors.gold} 16%, transparent);
  transition: transform 0.35s ${theme.motion.spring};
`;
const Name = styled.h3`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 800; color: ${theme.colors.primary}; margin-top: ${theme.spacing.xs};`;
const Text = styled.p`font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.textMuted};`;
const Go = styled.span`
  position: absolute; top: ${theme.spacing.md}; inset-inline-end: ${theme.spacing.md};
  opacity: 0; transform: translateX(6px); transition: opacity 0.25s ease, transform 0.25s ${theme.motion.outStrong};
  color: ${theme.colors.gold};
`;

const Extras = styled.ul<{ $shown: boolean }>`
  list-style: none; display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm}; justify-content: center;
  margin-top: ${theme.spacing.md};
  opacity: ${p => (p.$shown ? 1 : 0)}; transition: opacity 0.8s ease 0.7s;
  li {
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: ${theme.radii.pill};
    font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.textMuted};
    background: ${theme.colors.surfaceAlt}; border: 1px solid ${theme.colors.borderLight};
  }
  li::before { content: '✦'; color: ${theme.colors.gold}; font-size: 0.7em; }
`;

/** What's inside: a bento of the main features, each a door into it. */
export default function AboutFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref);
  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Wrap aria-labelledby="about-features">
      <Kicker>{HE.ABOUT_FEATURES_KICKER}</Kicker>
      <Title id="about-features">{HE.ABOUT_FEATURES_TITLE}</Title>
      <Bento ref={ref}>
        {HE.ABOUT_FEATURES_LIST.map((f, i) => (
          <Tile key={f.href} href={f.href} $big={!!f.big} $shown={shown} $i={i} onPointerMove={onMove}>
            <Chip className="chip" aria-hidden><LineIcon name={f.icon} size={24} strokeWidth={1.8} /></Chip>
            <Go className="go" aria-hidden><LineIcon name="arrow" size={20} /></Go>
            <Name>{f.title}</Name>
            <Text>{f.text}</Text>
          </Tile>
        ))}
      </Bento>
      <Extras $shown={shown}>{HE.ABOUT_EXTRAS.map(x => <li key={x}>{x}</li>)}</Extras>
    </Wrap>
  );
}
