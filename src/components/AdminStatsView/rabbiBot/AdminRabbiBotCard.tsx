'use client';

import { useEffect, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { computeDelta, Delta } from '@/lib/adminStatsUtils';
import type { RabbiBotAdminStats } from '@/types/rabbiBot';
import AdminRabbiBotLists from './AdminRabbiBotLists';
import {
  Card, TitleRow, TitleIcon, CardTitle, CardSub, Kpis, Kpi, KpiValue, KpiLabel, DeltaTag,
  Grid, Section, SectionTitle, Bars, BarRow, BarName, Track, Fill, BarNum, Pill, Empty,
} from './adminBotStyles';

const fmt = (n: number) => n.toLocaleString('he-IL');

function BarList({ rows }: { rows: { label: string; n: number }[] }) {
  const max = Math.max(1, ...rows.map(r => r.n));
  return (
    <Bars>
      {rows.map(r => (
        <BarRow key={r.label}>
          <BarName title={r.label}>{r.label}</BarName>
          <Track><Fill $pct={(r.n / max) * 100} /></Track>
          <BarNum>{fmt(r.n)}</BarNum>
        </BarRow>
      ))}
    </Bars>
  );
}

/** רבי־בוט usage, answer quality, ratings and today's quota — fetched on its own. */
export default function AdminRabbiBotCard() {
  const [s, setS] = useState<RabbiBotAdminStats | null>(null);

  useEffect(() => {
    fetch('/api/rabbi-bot/stats')
      .then(r => (r.ok ? r.json() as Promise<RabbiBotAdminStats> : null))
      .then(setS)
      .catch(() => setS(null));
  }, []);

  if (!s) return null;

  const kpis: { label: string; value: string; delta?: Delta }[] = [
    { label: HE.RB_ADMIN_TODAY, value: fmt(s.today), delta: computeDelta(s.today, s.yesterday) },
    { label: HE.RB_ADMIN_WEEK, value: fmt(s.week), delta: computeDelta(s.week, s.prevWeek) },
    { label: HE.RB_ADMIN_ASKERS, value: fmt(s.askers10d) },
    { label: `${HE.RB_ADMIN_RATING} (${HE.RB_ADMIN_RATING_N(s.ratingCount)})`, value: s.ratingAvg === null ? '—' : `${s.ratingAvg} ★` },
    { label: HE.RB_ADMIN_REPORTS, value: fmt(s.reports) },
    { label: HE.RB_ADMIN_ANSWERED, value: `${s.answeredPct}%` },
    { label: HE.RB_ADMIN_VERIFIED, value: `${s.verifiedPct}%` },
    { label: HE.RB_ADMIN_LATENCY, value: HE.RB_ADMIN_SECONDS(Math.round(s.avgLatencyMs / 100) / 10) },
    { label: HE.RB_ADMIN_CACHED, value: `${s.cachedPct}%` },
    { label: HE.RB_ADMIN_TOTAL, value: fmt(s.total) },
  ];
  const usedToday = new Map(s.modelsToday.map(m => [m.model, m.count]));

  return (
    <Card>
      <TitleRow>
        <TitleIcon><LineIcon name="ask" size={18} strokeWidth={1.8} /></TitleIcon>
        <CardTitle>{HE.RB_ADMIN_TITLE}</CardTitle>
        <CardSub>{HE.RB_ADMIN_SUB(s.total)}</CardSub>
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

      <Section>
        <SectionTitle>{HE.RB_ADMIN_QUOTA}</SectionTitle>
        <Bars>
          {s.models.map(m => (
            <BarRow key={m}>
              <BarName title={m}>{m}</BarName>
              <span>{s.exhaustedToday.includes(m) ? <Pill $bad>{HE.RB_ADMIN_QUOTA_OUT}</Pill> : <Pill>{HE.RB_ADMIN_QUOTA_OK}</Pill>}</span>
              <BarNum>{fmt(usedToday.get(m) ?? 0)}</BarNum>
            </BarRow>
          ))}
        </Bars>
      </Section>

      {s.total === 0 ? <Empty>{HE.RB_ADMIN_EMPTY}</Empty> : (
        <>
          <Grid>
            <Section>
              <SectionTitle>{HE.RB_ADMIN_BY_TOPIC}</SectionTitle>
              <BarList rows={s.byTopic.map(t => ({ label: HE.RB_TOPIC[t.topic] ?? t.topic, n: t.count }))} />
            </Section>
            <Section>
              <SectionTitle>{HE.RB_ADMIN_BY_STATUS}</SectionTitle>
              <BarList rows={Object.entries(s.byStatus).map(([k, n]) => ({ label: HE.RB_STATUS[k] ?? k, n: n ?? 0 }))} />
            </Section>
            <Section>
              <SectionTitle>{HE.RB_ADMIN_BOOKS}</SectionTitle>
              <BarList rows={s.topBooks.map(b => ({ label: b.book, n: b.count }))} />
            </Section>
            <Section>
              <SectionTitle>{HE.RB_ADMIN_DIST}</SectionTitle>
              <BarList rows={s.ratingDist.map((n, i) => ({ label: '★'.repeat(i + 1), n })).reverse()} />
            </Section>
          </Grid>
          <AdminRabbiBotLists lowRated={s.lowRated} recent={s.recent} />
        </>
      )}
    </Card>
  );
}
