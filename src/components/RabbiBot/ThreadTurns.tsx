'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { LastAnswer } from '@/lib/rabbiBot/client';

/**
 * The conversation so far, above a follow-up: each earlier question and its
 * short answer, compact and joined by a thread line, so the follow-up reads
 * in context (the full answers stay in the history).
 */
const List = styled.ol`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  padding-inline-start: ${theme.spacing.ms};
  border-inline-start: 2px solid color-mix(in srgb, ${theme.colors.primary} 22%, transparent);
`;

const Turn = styled.li`display: flex; flex-direction: column; gap: 4px;`;

const Asked = styled.p`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; line-height: 1.45; color: ${theme.colors.primary};
`;

const Short = styled.p`
  font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.textMuted};
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
`;

export default function ThreadTurns({ turns }: { turns: LastAnswer[] }) {
  if (turns.length === 0) return null;
  return (
    <List aria-label={HE.RB_THREAD_ARIA}>
      {turns.map((t, i) => (
        <Turn key={`${t.id}|${i}`}>
          <Asked>{t.question}</Asked>
          <Short>{t.answer.status === 'answered' && t.answer.short ? t.answer.short : HE.RB_THREAD_NOT_FOUND}</Short>
        </Turn>
      ))}
    </List>
  );
}
