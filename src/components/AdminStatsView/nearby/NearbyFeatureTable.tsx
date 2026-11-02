'use client';

import { HE } from '@/lib/hebrewTexts';
import type { NearbyFeatureStats } from '@/types/nearbyStats';
import { TableWrap, Table, Dot, SERIES } from './nearbyStyles';

const fmt = (n: number) => n.toLocaleString('he-IL');

const ROWS: { key: string; value: (f: NearbyFeatureStats) => string }[] = [
  { key: 'today', value: f => fmt(f.today) },
  { key: 'week', value: f => fmt(f.week) },
  { key: 'month', value: f => fmt(f.month) },
  { key: 'searchers7d', value: f => fmt(f.searchers7d) },
  { key: 'avgResults', value: f => (f.month ? String(f.avgResults) : '—') },
  { key: 'zeroPct', value: f => (f.month ? `${f.zeroPct}%` : '—') },
  { key: 'medianNearestM', value: f => (f.medianNearestM === null ? '—' : HE.NS_M(f.medianNearestM)) },
  { key: 'gpsPct', value: f => (f.month ? `${f.gpsPct}%` : '—') },
  { key: 'avgLatencyMs', value: f => (f.month ? HE.NS_SECONDS(f.avgLatencyMs) : '—') },
  { key: 'degradedPct', value: f => (f.month ? `${f.degradedPct}%` : '—') },
];

/** Metrics as rows, one column per feature — three columns fit a phone. */
export default function NearbyFeatureTable({ features }: { features: NearbyFeatureStats[] }) {
  return (
    <TableWrap>
      <Table>
        <caption>{HE.NS_TABLE_CAPTION}</caption>
        <thead>
          <tr>
            <th scope="col">{HE.NS_METRIC}</th>
            {features.map(f => <th key={f.feature} scope="col"><Dot $c={SERIES[f.feature]} />{HE.NS_FEATURE[f.feature]}</th>)}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(r => (
            <tr key={r.key}>
              <th scope="row">{HE.NS_ROWS[r.key]}</th>
              {features.map(f => <td key={f.feature}>{r.value(f)}</td>)}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}
