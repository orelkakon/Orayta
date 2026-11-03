'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { isNewFeature } from '@/lib/newBadges';
import { Card as BaseCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

/**
 * Home: one card for everything "near me" (minyan · mikveh · kivrei), three
 * stops on a dashed route over a faint street grid.
 */
const Card = styled(BaseCard)`
  overflow: hidden;
  background-color: ${theme.colors.surface};
  background-image:
    radial-gradient(120% 90% at 50% 0%, transparent 25%, ${theme.colors.surface} 80%),
    linear-gradient(color-mix(in srgb, ${theme.colors.border} 55%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, ${theme.colors.border} 55%, transparent) 1px, transparent 1px);
  background-size: 100% 100%, 22px 22px, 22px 22px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const Head = styled.div`display: flex; flex-direction: column; gap: 2px;`;

const Eyebrow = styled.span`
  display: inline-flex; align-items: center; gap: 5px;
  font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.secondaryText};
`;

const Title = styled.h2`font-size: ${theme.fontSizes.xl}; line-height: 1.2; color: ${theme.colors.text};`;

const Sub = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

const Tiles = styled.ul`
  list-style: none; position: relative;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.xs};
  &::before {
    content: ''; position: absolute; top: 28px; left: 17%; right: 17%;
    border-top: 1.5px dashed color-mix(in srgb, ${theme.colors.gold} 65%, transparent);
  }
`;

const Tile = styled(Link)`
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 0 2px 4px; border-radius: 14px; text-align: center;
  transition: transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.95); }
`;

const Medallion = styled.span`
  position: relative; width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.primary};
  background: radial-gradient(circle at 32% 28%, ${theme.colors.surface}, ${theme.colors.goldSoft} 80%);
  border: 1.5px solid color-mix(in srgb, ${theme.colors.gold} 60%, transparent);
  box-shadow: ${theme.shadows.sm};
  transition: transform 0.2s ${theme.motion.outStrong}, box-shadow 0.2s ease;
  @media (hover: hover) and (pointer: fine) { ${Tile}:hover & { transform: translateY(-3px); box-shadow: ${theme.shadows.md}; } }
`;

const NewTag = styled(Badge)`position: absolute; top: -8px; inset-inline-end: -14px; box-shadow: 0 0 0 2px ${theme.colors.surface};`;

const Label = styled.span`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; font-weight: 700;
  color: ${theme.colors.text}; line-height: 1.2;
`;

const TileSub = styled.span`font-size: ${theme.fontSizes.xxs}; color: ${theme.colors.textMuted}; line-height: 1.3;`;

export default function HomeNearbyHub() {
  // After mount: the home page is pre-rendered, a build-time date check could outlive the badge.
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  useEffect(() => { setFresh(new Set(HE.NB_TILES.map(t => t.href).filter(h => isNewFeature(h)))); }, []);

  return (
    <Card as="section" aria-label={HE.NB_ARIA}>
      <Head>
        <Eyebrow><LineIcon name="pin" size={13} strokeWidth={2.2} />{HE.NB_EYEBROW}</Eyebrow>
        <Title>{HE.NB_TITLE}</Title>
        <Sub>{HE.NB_SUB}</Sub>
      </Head>
      <Tiles>
        {HE.NB_TILES.map(t => (
          <li key={t.href}>
            <Tile href={t.href} aria-label={`${t.label} — ${t.sub}`}>
              <Medallion>
                <LineIcon name={t.icon} size={26} />
                {fresh.has(t.href) && <NewTag $tone="new">{HE.NEW_BADGE}</NewTag>}
              </Medallion>
              <Label>{t.label}</Label>
              <TileSub>{t.sub}</TileSub>
            </Tile>
          </li>
        ))}
      </Tiles>
    </Card>
  );
}
