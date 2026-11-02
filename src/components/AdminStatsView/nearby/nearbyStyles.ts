import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { NearbyFeature } from '@/types/nearbyStats';

/** One colour per feature, the same in every chart and legend of the card. */
export const SERIES: Record<NearbyFeature, string> = {
  minyan: theme.colors.chart1,
  mikveh: theme.colors.chart2,
  kivrei: theme.colors.chart3,
};

export const TableWrap = styled.div`overflow-x: auto; -webkit-overflow-scrolling: touch;`;

export const Table = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.8rem; min-width: 320px;
  caption { text-align: start; font-size: 0.82rem; font-weight: 700; color: ${theme.colors.textMuted}; padding-bottom: ${theme.spacing.sm}; }
  th, td { padding: 6px ${theme.spacing.sm}; text-align: start; border-bottom: 1px solid ${theme.colors.borderLight}; }
  thead th { font-weight: 700; color: ${theme.colors.text}; white-space: nowrap; }
  tbody th { font-weight: 600; color: ${theme.colors.textMuted}; }
  td { font-family: ${theme.fonts.ui}; font-weight: 700; color: ${theme.colors.text}; font-variant-numeric: tabular-nums; }
`;

export const Dot = styled.span<{ $c: string }>`
  display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-inline-end: 5px; background: ${p => p.$c};
`;

/* Stacked share bar for an area row. */
export const Stack = styled.div`display: flex; gap: 2px; height: 8px; border-radius: 999px; overflow: hidden; background: ${theme.colors.surfaceAlt};`;
export const StackPart = styled.div<{ $pct: number; $c: string }>`width: ${p => p.$pct}%; background: ${p => p.$c};`;

/* 24 hour columns; time reads left→right. */
export const Hours = styled.div`
  direction: ltr; display: grid; grid-template-columns: repeat(24, 1fr); gap: 2px; align-items: end; height: 72px;
`;
export const HourBar = styled.div<{ $pct: number; $peak: boolean }>`
  height: ${p => Math.max(p.$pct, 2)}%; border-radius: 3px 3px 0 0;
  background: ${p => (p.$peak ? theme.colors.primary : theme.colors.secondary)};
  opacity: ${p => (p.$pct === 0 ? 0.3 : 1)};
`;
export const HourAxis = styled.div`
  direction: ltr; display: flex; justify-content: space-between;
  font-size: 0.66rem; color: ${theme.colors.textLight}; font-family: ${theme.fonts.ui};
`;

export const Note = styled.p`font-size: 0.74rem; color: ${theme.colors.textLight};`;
export const ErrorNote = styled.p`font-size: 0.78rem; font-weight: 600; color: ${theme.colors.error};`;

export const ListRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};
  font-size: 0.8rem; color: ${theme.colors.text};
  & > span:first-child { font-weight: 600; color: ${theme.colors.textMuted}; min-width: 0; }
  & > span:last-child { font-family: ${theme.fonts.ui}; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
`;
