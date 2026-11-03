'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { learnKind } from '@/lib/dailyLearning/kinds';
import { useLearnToday } from '@/components/LearnView/useLearnData';
import { useLearnLog } from '@/components/LearnView/useLearnLog';
import LearnTodayList from '@/components/LearnView/LearnTodayList';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from './todayCardStyles';

const Body = styled.div`padding: ${theme.spacing.xs} ${theme.spacing.md} ${theme.spacing.sm};`;

const MoreBtn = styled.button`
  width: 100%; min-height: 44px; margin-top: 4px; border-radius: 12px;
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondaryText};
  &:active { background: ${theme.colors.surfaceAlt}; }
`;

const ParashaRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 4px; padding: ${theme.spacing.ms} 4px 6px;
  border-top: 1px solid ${theme.colors.borderLight};
`;
const ParashaLabel = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;
const ParashaVal = styled.span`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text};`;

const Placeholder = styled.div`
  padding: ${theme.spacing.lg}; text-align: center; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm};
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm};
`;

const Skel = styled.div`display: flex; flex-direction: column; gap: 14px; padding: 10px 4px;`;

/** Today's learning cycles — each opens the in-app reader; ✓ marks what was learned today. */
export default function DafYomiCard() {
  const { load, retry } = useLearnToday();
  const log = useLearnLog();
  const [more, setMore] = useState(false);

  const items = load.state === 'ready' ? load.data.items : [];
  const primary = items.filter(i => learnKind(i.kind).primary);
  const rest = items.filter(i => !learnKind(i.kind).primary);

  return (
    <Card>
      <CardHeader>{HE.TODAY_DAF_TITLE}</CardHeader>
      <Body>
        {load.state === 'loading' && (
          <Skel aria-busy="true" aria-label={HE.LOADING}>{[0, 1, 2, 3].map(i => <Skeleton key={i} $h="40px" $r="12px" />)}</Skel>
        )}
        {load.state === 'error' && (
          <Placeholder role="alert">{HE.TODAY_ERROR}<Button $variant="secondary" $size="sm" onClick={retry}>{HE.LEARN_RETRY}</Button></Placeholder>
        )}
        <LearnTodayList items={more ? [...primary, ...rest] : primary} isDone={log.isDone} />
        {rest.length > 0 && (
          <MoreBtn onClick={() => setMore(m => !m)} aria-expanded={more}>{more ? HE.LEARN_LESS : HE.LEARN_MORE}</MoreBtn>
        )}
        {load.state === 'ready' && load.data.parasha && (
          <ParashaRow>
            <ParashaLabel>{HE.TODAY_PARASHA}</ParashaLabel>
            <ParashaVal>{load.data.parasha}</ParashaVal>
          </ParashaRow>
        )}
      </Body>
    </Card>
  );
}
