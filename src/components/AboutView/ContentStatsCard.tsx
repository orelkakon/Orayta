'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';

const Card = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.xl}; padding: ${theme.spacing.xl} ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md}; width: 100%; max-width: 560px;
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.lg}; text-align: center;
`;

const Head = styled.div`display: flex; flex-direction: column; gap: 4px; width: 100%;`;

const SectionTitle = styled.h2`
  font-family: ${theme.fonts.body}; font-size: 1.15rem; font-weight: 700;
  color: ${theme.colors.primary};
`;

const SectionSub = styled.p`font-size: 0.78rem; color: ${theme.colors.textMuted};`;

const StatGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm}; width: 100%;
  /* a lone cell on the last row stretches across it instead of sitting orphaned */
  & > *:last-child:nth-child(3n + 1) { grid-column: 1 / -1; }
  @media (max-width: 440px) {
    grid-template-columns: repeat(2, 1fr);
    & > *:last-child:nth-child(3n + 1) { grid-column: auto; }
    & > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
  }
`;

const Cell = styled.div<{ $tint: string }>`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surfaceAlt};
  background: color-mix(in srgb, ${p => p.$tint} 7%, ${theme.colors.surface});
  border: 1px solid ${theme.colors.borderLight};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover { transform: translateY(-2px); box-shadow: ${theme.shadows.sm}; }
`;

const IconCircle = styled.span<{ $tint: string }>`
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${p => p.$tint};
  background: ${theme.colors.surface};
  background: color-mix(in srgb, ${p => p.$tint} 14%, ${theme.colors.surface});
`;

const CellNum = styled.div`
  font-family: ${theme.fonts.ui}; font-size: 1.5rem; font-weight: 700;
  line-height: 1; color: ${theme.colors.text};
`;

const CellLabel = styled.div`font-size: 0.75rem; font-weight: 600; color: ${theme.colors.textMuted};`;

function useAnimatedCount(target: number | null): number {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (target === null) return;
    const steps = 60; const duration = 1600; let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setDisplayed(Math.floor(eased * target));
      if (step >= steps) { setDisplayed(target); clearInterval(timer); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return displayed;
}

interface ContentStats {
  citations: number; rabbis: number; books: number;
  summaries: number; gematrias: number; chidushim: number;
  videos: number; dedications: number; prayers: number; questions: number;
}

const ITEMS: { key: keyof ContentStats; icon: string; label: string; tint: string }[] = [
  { key: 'citations',   icon: 'scroll',   label: HE.CONTENT_STATS_CITATIONS,   tint: theme.colors.primary },
  { key: 'rabbis',      icon: 'users',    label: HE.CONTENT_STATS_RABBIS,      tint: theme.colors.secondary },
  { key: 'books',       icon: 'book',     label: HE.CONTENT_STATS_BOOKS,       tint: theme.colors.accent },
  { key: 'summaries',   icon: 'quill',    label: HE.CONTENT_STATS_SUMMARIES,   tint: theme.colors.secondary },
  { key: 'gematrias',   icon: 'aleph',    label: HE.CONTENT_STATS_GEMATRIAS,   tint: theme.colors.accent },
  { key: 'chidushim',   icon: 'bulb',     label: HE.CONTENT_STATS_CHIDUSHIM,   tint: theme.colors.primary },
  { key: 'videos',      icon: 'camera',   label: HE.CONTENT_STATS_VIDEOS,      tint: theme.colors.accent },
  { key: 'dedications', icon: 'candle',   label: HE.CONTENT_STATS_DEDICATIONS, tint: theme.colors.primary },
  { key: 'prayers',     icon: 'sparkle',  label: HE.CONTENT_STATS_PRAYERS,     tint: theme.colors.secondary },
  { key: 'questions',   icon: 'target',   label: HE.CONTENT_STATS_QUESTIONS,   tint: theme.colors.primary },
];

function StatCell({ value, icon, label, tint }: { value: number | null; icon: string; label: string; tint: string }) {
  const displayed = useAnimatedCount(value);
  return (
    <Cell $tint={tint}>
      <IconCircle $tint={tint}><LineIcon name={icon} size={21} strokeWidth={1.7} /></IconCircle>
      <CellNum>{value === null ? '...' : displayed.toLocaleString('he-IL')}</CellNum>
      <CellLabel>{label}</CellLabel>
    </Cell>
  );
}

export default function ContentStatsCard() {
  const [stats, setStats] = useState<ContentStats | null>(null);

  useEffect(() => {
    void fetch('/api/stats').then(r => r.json()).then(setStats as (v: unknown) => void);
  }, []);

  return (
    <Card>
      <Head>
        <SectionTitle>{HE.STATS_CONTENT_TITLE}</SectionTitle>
        <SectionSub>{HE.CONTENT_STATS_SUB}</SectionSub>
      </Head>
      <StatGrid>
        {ITEMS.map(item => (
          <StatCell
            key={item.key}
            value={stats ? stats[item.key] : null}
            icon={item.icon}
            label={item.label}
            tint={item.tint}
          />
        ))}
      </StatGrid>
    </Card>
  );
}
