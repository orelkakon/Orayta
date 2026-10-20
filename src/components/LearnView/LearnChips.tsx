'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { learnKind } from '@/lib/dailyLearning/kinds';
import type { LearnItem, LearnKind } from '@/types/dailyLearning';

const Strip = styled.nav`
  display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;
  margin: 0 -${theme.spacing.lg}; padding: 2px ${theme.spacing.lg};
  ${theme.media.sm} { margin: 0 -${theme.spacing.md}; padding: 2px ${theme.spacing.md}; }
  &::-webkit-scrollbar { display: none; }
`;

const Chip = styled(Link)<{ $on: boolean }>`
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px;
  min-height: 34px; padding: 0 14px; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; white-space: nowrap;
  color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.textMuted};
  background: ${p => p.$on ? theme.colors.primary : 'transparent'};
  border: 1px solid ${p => p.$on ? theme.colors.primary : theme.colors.borderLight};
  transition: color ${theme.motion.fast}, background ${theme.motion.base} ${theme.motion.out};
  &:hover { color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.primary}; }
  svg { color: ${p => p.$on ? 'inherit' : theme.colors.success}; }
`;

/** Today's other cycles; a check marks the ones already learned. */
export default function LearnChips({ items, active, isDone }: { items: LearnItem[]; active: LearnKind; isDone: (k: LearnKind) => boolean }) {
  return (
    <Strip aria-label={HE.LEARN_KINDS_ARIA}>
      {items.map(it => (
        <Chip key={it.kind} href={`/today/learn/${it.kind}`} $on={it.kind === active}
          aria-current={it.kind === active ? 'page' : undefined}>
          {isDone(it.kind) && <LineIcon name="check" size={14} strokeWidth={2.4} />}
          {learnKind(it.kind).label}
        </Chip>
      ))}
    </Strip>
  );
}
