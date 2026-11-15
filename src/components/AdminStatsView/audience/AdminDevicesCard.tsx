'use client';

import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { shortDay } from '@/lib/adminStatsUtils';
import type { DevicesStats, ReturnRate } from '@/types/audience';
import { Card, TitleRow, TitleIcon, CardTitle, CardSub, Empty, Kpis6, Kpi, KpiValue, KpiLabel, KpiSub } from './audienceStyles';
import { Note, ErrorNote } from '../nearby/nearbyStyles';
import DevicesChart from './DevicesChart';

const fmt = (n: number) => n.toLocaleString('he-IL');
const pct = (r: ReturnRate) => (r.pct === null ? HE.DEV_NA : `${r.pct}%`);

/** New vs returning devices: today's split, 7/30-day uniques, D1/D7, 30-day chart. */
export default function AdminDevicesCard({ d }: { d: DevicesStats }) {
  const kpis: { label: string; value: string; sub?: string }[] = [
    { label: HE.DEV_NEW_TODAY, value: fmt(d.today.fresh) },
    { label: HE.DEV_RET_TODAY, value: fmt(d.today.returning) },
    { label: HE.DEV_UNIQ7, value: fmt(d.uniques7) },
    { label: HE.DEV_UNIQ30, value: fmt(d.uniques30) },
    { label: HE.DEV_D1, value: pct(d.d1), sub: d.d1.cohort ? HE.DEV_COHORT(d.d1.returned, d.d1.cohort) : undefined },
    { label: HE.DEV_D7, value: pct(d.d7), sub: d.d7.cohort ? HE.DEV_COHORT(d.d7.returned, d.d7.cohort) : undefined },
  ];
  const any = d.daily.some(p => p.fresh + p.returning > 0);

  return (
    <Card>
      <TitleRow>
        <TitleIcon><LineIcon name="users" size={18} strokeWidth={1.8} /></TitleIcon>
        <CardTitle>{HE.DEV_TITLE}</CardTitle>
        <CardSub>{HE.DEV_SUB}</CardSub>
        {d.since && <CardSub>· {HE.AUD_SINCE(shortDay(d.since))}</CardSub>}
      </TitleRow>

      {!d.configured && <ErrorNote>{HE.DEV_NO_SALT}</ErrorNote>}
      {!d.available ? <Empty>{HE.AUD_NO_TABLE}</Empty> : (
        <>
          <Kpis6>
            {kpis.map(k => (
              <Kpi key={k.label}>
                <KpiValue>{k.value}</KpiValue>
                <KpiLabel>{k.label}</KpiLabel>
                {k.sub && <KpiSub>{k.sub}</KpiSub>}
              </Kpi>
            ))}
          </Kpis6>
          {any ? <DevicesChart daily={d.daily} /> : <Empty>{HE.DEV_EMPTY}</Empty>}
        </>
      )}
      <Note>{HE.DEV_NOTE}</Note>
    </Card>
  );
}
