'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatCommentAge } from '@/components/FeedView/comments/formatCommentAge';
import type { RabbiBotGapRow } from '@/types/rabbiBot';
import { Section, SectionTitle, CardSub } from './adminBotStyles';

const List = styled.ol`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column;`;
const Item = styled.li`
  display: flex; flex-direction: column; gap: 3px; min-width: 0; padding: ${theme.spacing.sm} 0;
  &:not(:last-child) { border-bottom: 1px solid ${theme.colors.borderLight}; }
`;
const Question = styled.span`font-family: ${theme.fonts.body}; font-size: 0.9rem; line-height: 1.55; overflow-wrap: anywhere; color: ${theme.colors.text};`;
const Understood = styled.span`font-size: 0.8rem; line-height: 1.5; color: ${theme.colors.textMuted}; overflow-wrap: anywhere;`;
const Meta = styled.span`display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 0.7rem; color: ${theme.colors.textLight};`;
const Write = styled(Link)`
  align-self: flex-start; font-size: 0.8rem; font-weight: 700; color: ${theme.colors.primary};
  text-decoration: underline; text-underline-offset: 3px;
`;

/** Questions no verified source answered — each one a summary waiting to be written. */
export default function AdminRabbiBotGaps({ count, gaps }: { count: number; gaps: RabbiBotGapRow[] }) {
  if (count === 0) return null;
  return (
    <Section>
      <SectionTitle>{HE.RB_ADMIN_GAPS}</SectionTitle>
      <CardSub>{HE.RB_ADMIN_GAPS_SUB(count)}</CardSub>
      <List>
        {gaps.map(g => (
          <Item key={g.id}>
            <Question>{g.question}</Question>
            {g.understood && <Understood>{HE.RB_UNDERSTOOD} {g.understood}</Understood>}
            <Meta>
              <span>{formatCommentAge(g.createdAt)}</span>
              {g.topic && <span>· {HE.RB_TOPIC[g.topic] ?? g.topic}</span>}
              {g.books.length > 0 && <span>· {HE.RB_ADMIN_GAPS_BOOKS} {g.books.join(', ')}</span>}
            </Meta>
          </Item>
        ))}
      </List>
      <Write href="/sikumim">{HE.RB_ADMIN_GAPS_WRITE}</Write>
    </Section>
  );
}
