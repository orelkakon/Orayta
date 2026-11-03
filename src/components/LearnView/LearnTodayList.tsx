'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { learnKind } from '@/lib/dailyLearning/kinds';
import type { LearnItem, LearnKind } from '@/types/dailyLearning';

/**
 * Today's learning cycles as tappable rows (icon, cycle, today's portion,
 * ✓ when learned) — each opens the in-app reader. Shared by home and /today.
 */
const List = styled.ul`list-style: none; display: flex; flex-direction: column;`;

const Row = styled(Link)`
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  min-height: 60px; padding: 8px 4px;
  border-radius: 14px;
  transition: background-color 0.15s ease, transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.98); background: ${theme.colors.surfaceAlt}; }
  @media (hover: hover) and (pointer: fine) { &:hover { background: ${theme.colors.surfaceAlt}; } }
  li + li & { border-top: 1px solid ${theme.colors.borderLight}; border-radius: 0; }
`;

const Disc = styled.span<{ $done: boolean }>`
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: ${p => (p.$done ? theme.colors.onPrimary : theme.colors.primary)};
  background: ${p => (p.$done ? theme.colors.success : theme.colors.goldSoft)};
  transition: background-color 0.2s ease;
`;

const Texts = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;`;

const Kind = styled.span`font-size: ${theme.fontSizes.xs}; font-weight: 600; color: ${theme.colors.textMuted};`;

const Value = styled.span`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const End = styled.span`flex-shrink: 0; color: ${theme.colors.textLight};`;

interface Props {
  items: LearnItem[];
  isDone: (kind: LearnKind) => boolean;
}

export default function LearnTodayList({ items, isDone }: Props) {
  return (
    <List>
      {items.map(it => {
        const def = learnKind(it.kind);
        const done = isDone(it.kind);
        return (
          <li key={it.kind}>
            <Row href={`/today/learn/${it.kind}`} aria-label={`${def.label}: ${it.he}${done ? ` — ${HE.LEARN_DONE_ARIA}` : ''}`}>
              <Disc $done={done} aria-hidden="true">
                <LineIcon name={done ? 'check' : def.icon} size={done ? 18 : 20} strokeWidth={done ? 2.6 : 1.7} />
              </Disc>
              <Texts aria-hidden="true">
                <Kind>{def.label}</Kind>
                <Value>{it.he}</Value>
              </Texts>
              <End aria-hidden="true"><LineIcon name="chevron" size={18} /></End>
            </Row>
          </li>
        );
      })}
    </List>
  );
}
