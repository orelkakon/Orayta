'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { ContentStats, STAT_TILES } from './statTilesConfig';
import StatTile from './StatTile';

const Section = styled.section`
  width: 100%; max-width: 560px;
  background: linear-gradient(175deg,
    ${theme.colors.surface} 0%,
    color-mix(in srgb, ${theme.colors.surfaceAlt} 55%, ${theme.colors.surface}) 100%);
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
  ${theme.media.sm} { padding: ${theme.spacing.lg} ${theme.spacing.md}; }
`;

const Head = styled.header`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.sm}; text-align: center;
`;

const Ornament = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  width: 100%; max-width: 300px;
  color: ${theme.colors.secondary};
  font-size: 0.8rem; line-height: 1;

  &::before, &::after { content: ''; flex: 1; height: 1px; }
  &::before { background: linear-gradient(to right, ${theme.colors.secondary}, transparent); }
  &::after  { background: linear-gradient(to left,  ${theme.colors.secondary}, transparent); }
`;

const Title = styled.h2`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.h2}; font-weight: 700;
  color: ${theme.colors.primary};
  letter-spacing: 0.01em;
`;

const Sub = styled.p`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textMuted};
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 96px;
  grid-auto-flow: dense;
  gap: ${theme.spacing.ms};
  ${theme.media.sm} {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 92px;
  }
`;

export default function ContentStatsCard() {
  const [stats, setStats] = useState<ContentStats | null>(null);

  useEffect(() => {
    void fetch('/api/stats').then(r => r.json()).then(setStats as (v: unknown) => void);
  }, []);

  return (
    <Section aria-label={HE.STATS_CONTENT_TITLE}>
      <Head>
        <Ornament aria-hidden="true">✦</Ornament>
        <Title>{HE.STATS_CONTENT_TITLE}</Title>
        <Sub>{HE.CONTENT_STATS_SUB}</Sub>
      </Head>
      <Board>
        {STAT_TILES.map((tile, i) => (
          <StatTile key={tile.key} config={tile} value={stats ? stats[tile.key] : null} index={i} />
        ))}
      </Board>
    </Section>
  );
}
