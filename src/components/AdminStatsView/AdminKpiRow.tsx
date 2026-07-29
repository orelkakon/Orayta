'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { sumLast, computeDelta, Delta } from '@/lib/adminStatsUtils';
import type { AdminStats } from '@/types';

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: ${theme.spacing.md};
  @media (max-width: 720px) { grid-template-columns: repeat(2, 1fr); }
`;

const Tile = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex; flex-direction: column; gap: 6px;
`;

const IconWrap = styled.span`
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary};
  background: ${theme.colors.surfaceAlt};
  background: color-mix(in srgb, ${theme.colors.secondary} 14%, transparent);
`;

const Value = styled.div`
  font-family: ${theme.fonts.ui}; font-size: 1.9rem; font-weight: 700;
  line-height: 1.1; color: ${theme.colors.text};
`;

const Label = styled.div`font-size: 0.78rem; font-weight: 600; color: ${theme.colors.textMuted};`;

const DeltaTag = styled.span<{ $dir: Delta['dir'] }>`
  font-size: 0.72rem; font-weight: 600; direction: ltr;
  color: ${p => p.$dir === 'up' ? theme.colors.success : p.$dir === 'down' ? theme.colors.error : theme.colors.textLight};
`;

const Sub = styled.span`font-size: 0.72rem; color: ${theme.colors.textLight};`;

interface TileData {
  icon: string;
  label: string;
  value: number;
  delta?: Delta;
  deltaLabel?: string;
  sub?: string;
}

export default function AdminKpiRow({ stats }: { stats: AdminStats }) {
  const { daily } = stats;
  const usersToday = daily[daily.length - 1]?.users ?? 0;
  const usersYesterday = daily[daily.length - 2]?.users ?? 0;
  const usersWeek = sumLast(daily, 'users', 7);
  const usersPrevWeek = sumLast(daily, 'users', 7, 7);

  const tiles: TileData[] = [
    {
      icon: 'user', label: HE.ADMIN_USERS_TODAY, value: usersToday,
      delta: computeDelta(usersToday, usersYesterday), deltaLabel: HE.ADMIN_VS_YESTERDAY,
    },
    {
      icon: 'users', label: HE.ADMIN_USERS_WEEK, value: usersWeek,
      delta: computeDelta(usersWeek, usersPrevWeek), deltaLabel: HE.ADMIN_WEEK_VS_PREV,
    },
    { icon: 'eye', label: HE.ADMIN_VISITS_TOTAL, value: stats.visits, sub: HE.ADMIN_VISITS_TOTAL_SUB },
    { icon: 'home', label: HE.ADMIN_PWA_INSTALLS, value: stats.totals.pwa },
  ];

  return (
    <Grid>
      {tiles.map(t => (
        <Tile key={t.label}>
          <IconWrap><LineIcon name={t.icon} size={19} strokeWidth={1.8} /></IconWrap>
          <Value>{t.value.toLocaleString('he-IL')}</Value>
          <Label>{t.label}</Label>
          {t.delta && (
            <div><DeltaTag $dir={t.delta.dir}>{t.delta.text}</DeltaTag> <Sub>{t.deltaLabel}</Sub></div>
          )}
          {t.sub && <Sub>{t.sub}</Sub>}
        </Tile>
      ))}
    </Grid>
  );
}
