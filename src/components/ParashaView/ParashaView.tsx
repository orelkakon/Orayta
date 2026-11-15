'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SkeletonText } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ParashaPart, parsePart } from '@/lib/parasha/refs';
import { useParashaWeek } from './useParasha';
import ParashaOverview from './ParashaOverview';
import ParashaReader from './ParashaReader';

/**
 * /parasha — this week's parasha: overview (summary, a thought for Shabbat,
 * the aliyot, the haftara) and, with ?part=, the in-app reader. The part
 * lives in the URL so the back gesture returns to the overview.
 */
const ErrorBox = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl} ${theme.spacing.md}; text-align: center; color: ${theme.colors.textMuted};
  border-radius: ${theme.radii.lg}; border: 1px dashed ${theme.colors.border};
`;

export default function ParashaView() {
  const router = useRouter();
  const params = useSearchParams();
  const { date, load, retry } = useParashaWeek();

  if (load.state === 'loading') return <SkeletonText lines={8} />;
  if (load.state === 'error') {
    return (
      <ErrorBox role="alert">
        {HE.PARASHA_ERROR}
        <Button $size="sm" onClick={retry}>{HE.PARASHA_RETRY}</Button>
      </ErrorBox>
    );
  }

  const week = load.data;
  const part = parsePart(params.get('part'), week.aliyot.length);
  const open = (p: ParashaPart) => router.push(`/parasha?part=${p}`, { scroll: true });

  return part === null
    ? <ParashaOverview week={week} onOpen={open} />
    : <ParashaReader week={week} date={date} part={part} />;
}
