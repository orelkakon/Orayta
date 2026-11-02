'use client';

import { useEffect, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { computeDelta, Delta } from '@/lib/adminStatsUtils';
import type { NearbyAdminStats } from '@/types/nearbyStats';
import { Card, TitleRow, TitleIcon, CardTitle, CardSub, Kpis, Kpi, KpiValue, KpiLabel, DeltaTag, Empty } from '../rabbiBot/adminBotStyles';
import { Note, ErrorNote } from './nearbyStyles';
import NearbyDailyChart from './NearbyDailyChart';
import NearbyFeatureTable from './NearbyFeatureTable';
import NearbyLists from './NearbyLists';

const fmt = (n: number) => n.toLocaleString('he-IL');

/** Searches in מניין קרוב · מקווה בסביבה · קברי צדיקים — fetched on its own. */
export default function AdminNearbyCard() {
  const [s, setS] = useState<NearbyAdminStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/nearby-stats')
      .then(r => (r.ok ? r.json() as Promise<NearbyAdminStats> : null))
      .then(setS)
      .catch(() => setS(null));
  }, []);

  if (!s) return null;

  const kpis: { label: string; value: string; delta?: Delta }[] = [
    { label: HE.NS_TODAY, value: fmt(s.today), delta: computeDelta(s.today, s.yesterday) },
    { label: HE.NS_WEEK, value: fmt(s.week), delta: computeDelta(s.week, s.prevWeek) },
    { label: HE.NS_SEARCHERS, value: fmt(s.searchers7d) },
    { label: HE.NS_RETURNING, value: fmt(s.returning7d) },
    { label: HE.NS_ZERO, value: `${s.zeroPct}%` },
  ];
  const errors = s.features.reduce((n, f) => n + f.errors, 0);

  return (
    <Card>
      <TitleRow>
        <TitleIcon><LineIcon name="pin" size={18} strokeWidth={1.8} /></TitleIcon>
        <CardTitle>{HE.NS_TITLE}</CardTitle>
        <CardSub>{HE.NS_SUB(s.total)}</CardSub>
      </TitleRow>

      <Kpis>
        {kpis.map(k => (
          <Kpi key={k.label}>
            <KpiValue>{k.value}</KpiValue>
            <KpiLabel>{k.label}</KpiLabel>
            {k.delta && <DeltaTag $dir={k.delta.dir}>{k.delta.text}</DeltaTag>}
          </Kpi>
        ))}
      </Kpis>

      {s.total === 0 ? <Empty>{HE.NS_EMPTY}</Empty> : (
        <>
          <NearbyDailyChart daily={s.daily} />
          <NearbyFeatureTable features={s.features} />
          {errors > 0 && <ErrorNote>{HE.NS_ERRORS(errors)}</ErrorNote>}
          <NearbyLists s={s} />
        </>
      )}
      <Note>{HE.NS_PRIVACY}</Note>
    </Card>
  );
}
