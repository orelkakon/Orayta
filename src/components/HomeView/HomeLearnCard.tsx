'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { learnKind } from '@/lib/dailyLearning/kinds';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import LearnTodayList from '@/components/LearnView/LearnTodayList';
import { useLearnLog } from '@/components/LearnView/useLearnLog';
import type { Load } from '@/components/LearnView/useLearnData';
import type { LearnToday } from '@/types/dailyLearning';

/** Home: today's main learning cycles with progress, into the reader. */
const Progress = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  margin: -4px 0 ${theme.spacing.sm};
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; font-variant-numeric: tabular-nums;
`;

const Track = styled.span`
  flex: 1; height: 4px; border-radius: 2px; overflow: hidden;
  background: ${theme.colors.surfaceAlt};
`;

const Fill = styled.span<{ $p: number }>`
  display: block; height: 100%; border-radius: 2px;
  background: ${theme.colors.success};
  transform-origin: right; transform: scaleX(${p => p.$p});
  transition: transform 0.5s ${theme.motion.outStrong};
`;

const Skel = styled.div`display: flex; flex-direction: column; gap: 14px; padding: 8px 4px;`;

export default function HomeLearnCard({ load }: { load: Load<LearnToday> }) {
  const log = useLearnLog();
  if (load.state === 'error') return null;

  const items = load.state === 'ready' ? load.data.items.filter(i => learnKind(i.kind).primary) : [];
  const done = items.filter(i => log.isDone(i.kind)).length;

  return (
    <Card $pad="md">
      <SectionHeader title={HE.HOME_LEARN_TITLE} action={{ href: '/today', label: HE.HOME_LEARN_ALL }} />
      {load.state === 'loading' ? (
        <Skel aria-busy="true" aria-label={HE.LOADING}>
          {[0, 1, 2, 3].map(i => <Skeleton key={i} $h="40px" $r="12px" />)}
        </Skel>
      ) : (
        <>
          <Progress>
            <Track aria-hidden="true"><Fill $p={items.length ? done / items.length : 0} /></Track>
            <span>{HE.HOME_LEARN_PROGRESS(done, items.length)}</span>
          </Progress>
          <LearnTodayList items={items} isDone={log.isDone} />
        </>
      )}
    </Card>
  );
}
