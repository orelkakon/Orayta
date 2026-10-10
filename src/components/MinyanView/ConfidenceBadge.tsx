'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { ConfidenceLevel, MinyanTime, ScheduleStatus } from '@/types/minyan';
import { LEVEL_COLOR, STATUS_COLOR } from './minyanStyles';

const Pill = styled.span<{ $c: string; $hollow?: boolean }>`
  display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
  padding: 2px 8px; border-radius: ${theme.radii.xl};
  font-size: 0.7rem; font-weight: 700; line-height: 1.6; white-space: nowrap;
  color: ${p => p.$c};
  background: color-mix(in srgb, ${p => p.$c} 12%, transparent);
  border: 1px ${p => (p.$hollow ? 'dashed' : 'solid')} color-mix(in srgb, ${p => p.$c} 40%, transparent);
`;

const Dot = styled.span<{ $c: string; $hollow?: boolean }>`
  width: 7px; height: 7px; border-radius: 50%;
  background: ${p => (p.$hollow ? 'transparent' : p.$c)};
  border: 1.5px solid ${p => p.$c};
`;

export function LevelBadge({ level }: { level: ConfidenceLevel }) {
  const c = LEVEL_COLOR[level];
  return <Pill $c={c}><Dot $c={c} />{HE.MN_LEVELS[level]}</Pill>;
}

export function StatusBadge({ status }: { status: ScheduleStatus }) {
  const c = STATUS_COLOR[status];
  const hollow = status === 'unknown';
  return <Pill $c={c} $hollow={hollow}><Dot $c={c} $hollow={hollow} />{HE.MN_STATUS[status]}</Pill>;
}

/** The facts behind a grade, in words — shown next to every reported time. */
export function evidenceText(t: MinyanTime, now: Date): string {
  const age = HE.MN_AGE((now.getTime() - new Date(t.lastConfirmedAt).getTime()) / 86_400_000);
  const base = t.verified ? HE.MN_EVIDENCE_VERIFIED(age) : HE.MN_EVIDENCE(t.reporters, age);
  return t.disputes > 0 ? base + HE.MN_EVIDENCE_DISPUTES(t.disputes) : base;
}
