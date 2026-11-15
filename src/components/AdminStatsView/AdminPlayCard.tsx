'use client';

import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { shortDay } from '@/lib/adminStatsUtils';
import type { AdminStats } from '@/types';
import { Card, TitleRow, TitleIcon, CardTitle, CardSub, Kpis4, Kpi, KpiValue, KpiLabel } from './audience/audienceStyles';
import { Note } from './nearby/nearbyStyles';

const fmt = (n: number) => n.toLocaleString('he-IL');

/** Group-quiz games opened: today / 7 days / 30 days / since counting began. */
export default function AdminPlayCard({ games }: { games: AdminStats['games'] }) {
  const kpis = [
    { label: HE.PLAYC_TODAY, value: games.today },
    { label: HE.PLAYC_WEEK, value: games.week },
    { label: HE.PLAYC_MONTH, value: games.month },
    { label: HE.PLAYC_TOTAL, value: games.total },
  ];
  return (
    <Card>
      <TitleRow>
        <TitleIcon><LineIcon name="play" size={18} strokeWidth={1.8} /></TitleIcon>
        <CardTitle>{HE.PLAYC_TITLE}</CardTitle>
        {games.since && <CardSub>{HE.AUD_SINCE(shortDay(games.since))}</CardSub>}
      </TitleRow>
      <Kpis4>
        {kpis.map(k => (
          <Kpi key={k.label}>
            <KpiValue>{fmt(k.value)}</KpiValue>
            <KpiLabel>{k.label}</KpiLabel>
          </Kpi>
        ))}
      </Kpis4>
      <Note>{HE.PLAYC_NOTE}</Note>
    </Card>
  );
}
