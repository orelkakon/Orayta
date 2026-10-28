import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { Delta } from '@/lib/adminStatsUtils';

/* Same visual language as AdminCommentsCard. */

export const Card = styled.section`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

export const TitleRow = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
export const TitleIcon = styled.span`color: ${theme.colors.secondary}; display: flex;`;
export const CardTitle = styled.h2`font-size: 0.95rem; font-weight: 700; color: ${theme.colors.text};`;
export const CardSub = styled.span`font-size: 0.75rem; color: ${theme.colors.textLight};`;

export const Kpis = styled.div`
  display: grid; grid-template-columns: repeat(5, 1fr); gap: ${theme.spacing.sm};
  @media (max-width: 720px) { grid-template-columns: repeat(2, 1fr); }
`;

export const Kpi = styled.div`
  background: ${theme.colors.surfaceAlt}; border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.ms};
  display: flex; flex-direction: column; gap: 2px;
`;

export const KpiValue = styled.span`
  font-family: ${theme.fonts.ui}; font-size: 1.45rem; font-weight: 700; line-height: 1.15;
  color: ${theme.colors.text}; font-variant-numeric: tabular-nums;
`;

export const KpiLabel = styled.span`font-size: 0.74rem; font-weight: 600; color: ${theme.colors.textMuted};`;

export const DeltaTag = styled.span<{ $dir: Delta['dir'] }>`
  font-size: 0.7rem; font-weight: 600; direction: ltr; align-self: flex-start;
  color: ${p => p.$dir === 'up' ? theme.colors.success : p.$dir === 'down' ? theme.colors.error : theme.colors.textLight};
`;

export const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.md}; align-items: start;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

export const Section = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm}; min-width: 0;`;
export const SectionTitle = styled.h3`font-size: 0.82rem; font-weight: 700; color: ${theme.colors.textMuted};`;

export const Bars = styled.div`display: flex; flex-direction: column; gap: 6px;`;
export const BarRow = styled.div`
  display: grid; grid-template-columns: 120px 1fr 44px; align-items: center; gap: ${theme.spacing.sm};
  font-size: 0.8rem; color: ${theme.colors.text};
`;
export const BarName = styled.span`
  font-weight: 600; color: ${theme.colors.textMuted};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;
export const Track = styled.div`height: 8px; border-radius: 999px; background: ${theme.colors.surfaceAlt}; overflow: hidden;`;
export const Fill = styled.div<{ $pct: number }>`
  height: 100%; width: ${p => p.$pct}%; min-width: ${p => p.$pct > 0 ? '4px' : '0'};
  border-radius: inherit; background: ${theme.colors.secondary};
`;
export const BarNum = styled.span`font-family: ${theme.fonts.ui}; font-weight: 700; text-align: left; font-variant-numeric: tabular-nums;`;

export const Pill = styled.span<{ $bad?: boolean }>`
  font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: 999px;
  color: ${p => (p.$bad ? theme.colors.error : theme.colors.success)};
  background: ${p => (p.$bad ? theme.colors.bgError : theme.colors.bgSuccess)};
`;

export const Empty = styled.p`
  font-size: 0.85rem; color: ${theme.colors.textMuted}; text-align: center;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
`;
