'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { TehillimMode, TehillimStats } from '@/types/tehillim';
import { unitTitle } from '@/lib/tehillim/units';
import { Card } from '@/components/ui/Card';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { Section, SectionTitle, Muted } from '../styles';

/**
 * How the reading moves: a bar per hour (last day) or per day (two weeks),
 * the latest reads, and the names readers chose to leave.
 */
type Span = 'hourly' | 'daily';

const Bars = styled.div`height: 84px; display: flex; align-items: flex-end; gap: 3px; direction: ltr;`;
const Bar = styled.div<{ $h: number; $now: boolean }>`
  flex: 1; min-width: 3px; height: ${p => Math.max(4, p.$h)}%; border-radius: 3px 3px 1px 1px;
  background: ${p => (p.$now ? theme.colors.chart1 : `color-mix(in srgb, ${theme.colors.chart1} 55%, transparent)`)};
  transition: height ${theme.motion.slow} ${theme.motion.out};
`;
const Axis = styled.div`display: flex; justify-content: space-between; font-size: ${theme.fontSizes.xxs}; color: ${theme.colors.textLight};`;
const List = styled.ul`margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column;`;
const Row = styled.li`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; padding: 8px 0; font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.text}; border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
  & > span:first-child { color: ${theme.colors.gold}; }
`;
const Names = styled.div`display: flex; flex-wrap: wrap; gap: 6px;`;
const Name = styled.span`
  padding: 4px 10px; border-radius: ${theme.radii.pill}; font-size: ${theme.fontSizes.xs}; font-weight: 600;
  background: ${theme.colors.goldSoft}; color: ${theme.colors.text};
  & > b { margin-inline-start: 4px; color: ${theme.colors.secondaryText}; font-variant-numeric: tabular-nums; }
`;

const minutesAgo = (iso: string) => Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));

export default function Activity({ stats, mode }: { stats: TehillimStats; mode: TehillimMode }) {
  const [span, setSpan] = useState<Span>('hourly');
  const data = stats[span];
  const max = Math.max(1, ...data);
  if (stats.readUnits === 0) return null;
  return (
    <Section aria-labelledby="th-activity">
      <SectionTitle id="th-activity">{HE.TH_ACTIVITY_TITLE}<small>{HE.TH_TODAY(stats.today)}</small></SectionTitle>
      <Card $pad="md">
        <SegmentedControl<Span>
          ariaLabel={HE.TH_ACTIVITY_TITLE}
          value={span}
          onChange={setSpan}
          options={[{ value: 'hourly', label: HE.TH_ACTIVITY_HOURLY }, { value: 'daily', label: HE.TH_ACTIVITY_DAILY }]}
        />
        <div style={{ height: 14 }} />
        <Bars role="img" aria-label={`${span === 'hourly' ? HE.TH_ACTIVITY_HOURLY : HE.TH_ACTIVITY_DAILY}: ${data.join(', ')}`}>
          {data.map((v, i) => <Bar key={i} $h={(v / max) * 100} $now={i === data.length - 1} title={String(v)} />)}
        </Bars>
        <Axis aria-hidden="true"><span>{span === 'hourly' ? '−24' : '−14'}</span><span>{HE.TH_AGO(0)}</span></Axis>
      </Card>
      {stats.recent.length > 0 && (
        <Card $pad="md">
          <Muted style={{ fontWeight: 700, marginBottom: 4 }}>{HE.TH_RECENT_TITLE}</Muted>
          <List>
            {stats.recent.map(r => (
              <Row key={`${r.round}-${r.unit}-${r.at}`}><span>✓</span><span>{HE.TH_RECENT_ROW(unitTitle(mode, r.unit), HE.TH_AGO(minutesAgo(r.at)), r.name)}</span></Row>
            ))}
          </List>
        </Card>
      )}
      {stats.named.length > 0 && (
        <Card $pad="md">
          <Muted style={{ fontWeight: 700, marginBottom: 8 }}>{HE.TH_NAMED_TITLE}</Muted>
          <Names>{stats.named.map(n => <Name key={n.name}>{n.name}{n.count > 1 && <b>×{n.count}</b>}</Name>)}</Names>
        </Card>
      )}
    </Section>
  );
}
