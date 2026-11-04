'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { LastAnswer } from '@/lib/rabbiBot/client';
import { LinkBtn } from './styles';

const Wrap = styled.section`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;
const Head = styled.div`display: flex; align-items: baseline; justify-content: space-between; gap: ${theme.spacing.sm};`;
const Title = styled.h3`margin: 0; font-size: ${theme.fontSizes.sm}; font-weight: 800; color: ${theme.colors.textMuted};`;
const List = styled.ul`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column;`;
const Item = styled.button`
  width: 100%; min-height: 44px; display: flex; align-items: center; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} 0; text-align: start; color: ${theme.colors.text};
  border-bottom: 1px solid ${theme.colors.borderLight};
  li:last-child > & { border-bottom: none; }
  & > svg { flex-shrink: 0; color: ${theme.colors.textLight}; }
`;
const Text = styled.span`
  flex: 1; min-width: 0; font-size: ${theme.fontSizes.sm}; line-height: 1.45;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;
const Status = styled.span<{ $ok: boolean }>`
  flex-shrink: 0; font-size: ${theme.fontSizes.xs}; font-weight: 700;
  color: ${p => (p.$ok ? theme.colors.success : theme.colors.textLight)};
`;

interface Props {
  items: LastAnswer[];
  onOpen: (item: LastAnswer) => void;
  onClear: () => void;
}

/** This device's latest questions — tap to see the answer again without asking. */
export default function RecentQuestions({ items, onOpen, onClear }: Props) {
  if (items.length === 0) return null;
  return (
    <Wrap>
      <Head>
        <Title>{HE.RB_HISTORY_TITLE}</Title>
        <LinkBtn type="button" onClick={onClear}>{HE.RB_HISTORY_CLEAR}</LinkBtn>
      </Head>
      <List>
        {items.map(h => (
          <li key={`${h.id}|${h.question}`}>
            <Item type="button" onClick={() => onOpen(h)} aria-label={HE.RB_HISTORY_OPEN(h.question)}>
              <LineIcon name="ask" size={17} />
              <Text>{h.question}</Text>
              <Status $ok={h.answer.status === 'answered'}>{HE.RB_HISTORY_STATUS[h.answer.status] ?? ''}</Status>
            </Item>
          </li>
        ))}
      </List>
    </Wrap>
  );
}
