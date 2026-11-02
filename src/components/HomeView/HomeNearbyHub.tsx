'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { isNewFeature } from '@/lib/newBadges';

const fadeUp = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;
const popIn = keyframes`from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: none; }`;

/* Gold hairline frame — same family as the dedications card below it. */
const Frame = styled.section`
  width: 100%; padding: 1.5px; border-radius: ${theme.radii.xl};
  background: linear-gradient(150deg, rgba(196,149,106,0.9) 0%, rgba(196,149,106,0.22) 35%, rgba(196,149,106,0.22) 65%, rgba(196,149,106,0.9) 100%);
  box-shadow: ${theme.shadows.sm};
`;

/* Faint street grid fading toward the edges: "this is about the map around you". */
const Card = styled.div`
  position: relative; overflow: hidden;
  border-radius: calc(${theme.radii.xl} - 1.5px);
  padding: ${theme.spacing.md} ${theme.spacing.ms} ${theme.spacing.ms};
  background-color: ${theme.colors.surface};
  background-image:
    radial-gradient(120% 90% at 50% 0%, transparent 30%, ${theme.colors.surface} 78%),
    linear-gradient(color-mix(in srgb, ${theme.colors.border} 50%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, ${theme.colors.border} 50%, transparent) 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px, 24px 24px;
  display: flex; flex-direction: column; gap: ${theme.spacing.ms};
`;

const Head = styled.div`display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px;`;

const Eyebrow = styled.span`
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.2em; color: ${theme.colors.secondary};
`;

const Title = styled.h2`font-family: ${theme.fonts.body}; font-size: 1.22rem; font-weight: 800; color: ${theme.colors.primary};`;
const Sub = styled.p`font-size: 0.78rem; color: ${theme.colors.textMuted};`;

/* Three stops on one dashed "route" drawn behind the medallions. */
const Tiles = styled.div`
  position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.xs};
  &::before {
    content: ''; position: absolute; top: 27px; left: 16%; right: 16%; height: 0;
    border-top: 1.5px dashed color-mix(in srgb, ${theme.colors.secondary} 60%, transparent);
  }
`;

const Tile = styled(Link)<{ $i: number }>`
  position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px;
  padding: 0 2px ${theme.spacing.xs}; border-radius: ${theme.radii.md};
  animation: ${fadeUp} 0.45s ${theme.motion.out} both; animation-delay: ${p => 120 + p.$i * 70}ms;
  -webkit-tap-highlight-color: transparent;
  &:focus-visible { outline: 2px solid ${theme.colors.primary}; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Medallion = styled.span`
  position: relative; width: 54px; height: 54px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary};
  background: radial-gradient(circle at 32% 28%, color-mix(in srgb, ${theme.colors.secondary} 30%, ${theme.colors.surface}), ${theme.colors.surface} 75%);
  border: 1.5px solid color-mix(in srgb, ${theme.colors.secondary} 60%, transparent);
  box-shadow: 0 3px 12px rgba(92,61,30,0.16), inset 0 1px 0 rgba(255,255,255,0.4);
  transition: transform ${theme.motion.base} ${theme.motion.spring}, color ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
  ${Tile}:hover & { transform: translateY(-3px); color: ${theme.colors.primary}; box-shadow: 0 8px 18px rgba(92,61,30,0.22); }
  ${Tile}:active & { transform: scale(0.94); }
`;

const Label = styled.span`
  font-family: ${theme.fonts.body}; font-size: clamp(0.88rem, 3.6vw, 1.02rem); font-weight: 800;
  color: ${theme.colors.primary}; line-height: 1.2;
`;

const TileSub = styled.span`font-size: clamp(0.62rem, 2.6vw, 0.72rem); color: ${theme.colors.textMuted}; line-height: 1.3;`;

const NewBadge = styled.span`
  position: absolute; top: -6px; inset-inline-end: -12px;
  padding: 0 6px; border-radius: ${theme.radii.xl};
  font-size: 0.6rem; font-weight: 800; line-height: 1.6;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.success};
  box-shadow: 0 0 0 2px ${theme.colors.surface};
  animation: ${popIn} 0.35s ${theme.motion.spring} 0.5s both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

/** Home: one framed card for everything "near me" instead of a card per feature. */
export default function HomeNearbyHub() {
  // After mount: the home page is pre-rendered, a build-time date check could outlive the badge.
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  useEffect(() => { setFresh(new Set(HE.NB_TILES.map(t => t.href).filter(h => isNewFeature(h)))); }, []);

  return (
    <Frame aria-label={HE.NB_ARIA}>
      <Card>
        <Head>
          <Eyebrow><LineIcon name="pin" size={12} strokeWidth={2.2} /> {HE.NB_EYEBROW}</Eyebrow>
          <Title>{HE.NB_TITLE}</Title>
          <Sub>{HE.NB_SUB}</Sub>
        </Head>
        <Tiles>
          {HE.NB_TILES.map((t, i) => (
            <Tile key={t.href} href={t.href} $i={i} aria-label={`${t.label} — ${t.sub}`}>
              <Medallion>
                <LineIcon name={t.icon} size={26} />
                {fresh.has(t.href) && <NewBadge>{HE.NEW_BADGE}</NewBadge>}
              </Medallion>
              <Label>{t.label}</Label>
              <TileSub>{t.sub}</TileSub>
            </Tile>
          ))}
        </Tiles>
      </Card>
    </Frame>
  );
}
