'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Reliability, ReliabilityLevel } from '@/types/minyan';
import { LEVEL_COLOR, Muted } from './minyanStyles';

const Row = styled.div`display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px;`;

const Label = styled.span`font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.text};`;

const Pill = styled.span<{ $c: string }>`
  display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
  padding: 1px 8px; border-radius: ${theme.radii.xl};
  font-size: 0.7rem; font-weight: 700; line-height: 1.7; white-space: nowrap;
  color: ${p => p.$c};
  background: color-mix(in srgb, ${p => p.$c} 12%, transparent);
  border: 1px solid color-mix(in srgb, ${p => p.$c} 40%, transparent);
`;

/* Three filled bars for high, two for medium, one for low — readable without color. */
const Bars = styled.span<{ $n: number; $c: string }>`
  display: inline-flex; align-items: flex-end; gap: 1.5px; height: 9px;
  i { width: 3px; border-radius: 1px; background: color-mix(in srgb, ${p => p.$c} 25%, transparent); }
  i:nth-child(1) { height: 4px; } i:nth-child(2) { height: 6.5px; } i:nth-child(3) { height: 9px; }
  i:nth-child(-n + ${p => p.$n}) { background: ${p => p.$c}; }
`;

const BARS: Record<ReliabilityLevel, number> = { high: 3, medium: 2, low: 1 };

export function LevelPill({ level }: { level: ReliabilityLevel }) {
  const c = LEVEL_COLOR[level];
  return (
    <Pill $c={c}>
      <Bars $n={BARS[level]} $c={c} aria-hidden="true"><i /><i /><i /></Bars>
      {HE.MN_LEVELS[level]}
    </Pill>
  );
}

/** "מיקום: [אמינות גבוהה] 2 מקורות בלתי תלויים ועדכניים מסכימים" */
export default function ReliabilityBadge({ label, r }: { label: string; r: Reliability }) {
  return (
    <Row>
      <Label>{label}:</Label>
      <LevelPill level={r.level} />
      <Muted>{HE.MN_REASON[r.reason](r.independent, r.total)}</Muted>
    </Row>
  );
}
