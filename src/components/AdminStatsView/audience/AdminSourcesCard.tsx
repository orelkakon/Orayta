'use client';

import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { shortDay } from '@/lib/adminStatsUtils';
import type { SourcesStats } from '@/types/audience';
import { Card, TitleRow, TitleIcon, CardTitle, CardSub, Empty, Section, Stack, TextCell } from './audienceStyles';
import { TableWrap, Table, Note } from '../nearby/nearbyStyles';

const fmt = (n: number) => n.toLocaleString('he-IL');

/** Arrivals per traffic source (today / 7 / 30 days) and the top UTM campaigns. */
export default function AdminSourcesCard({ s }: { s: SourcesStats }) {
  const total = s.rows.reduce((n, r) => n + r.month, 0);
  const utmLabel = (v: string) => (v === 'share' ? HE.SRC_SHARE : v || HE.SRC_NONE);

  return (
    <Card>
      <TitleRow>
        <TitleIcon><LineIcon name="map" size={18} strokeWidth={1.8} /></TitleIcon>
        <CardTitle>{HE.SRC_TITLE}</CardTitle>
        <CardSub>{HE.SRC_SUB}</CardSub>
        {s.since && <CardSub>· {HE.AUD_SINCE(shortDay(s.since))}</CardSub>}
      </TitleRow>

      {!s.available ? <Empty>{HE.AUD_NO_TABLE}</Empty> : total === 0 ? <Empty>{HE.SRC_EMPTY}</Empty> : (
        <Stack>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th scope="col">{HE.SRC_COL_SOURCE}</th>
                  <th scope="col">{HE.SRC_COL_TODAY}</th>
                  <th scope="col">{HE.SRC_COL_WEEK}</th>
                  <th scope="col">{HE.SRC_COL_MONTH}</th>
                  <th scope="col">%</th>
                </tr>
              </thead>
              <tbody>
                {s.rows.filter(r => r.month > 0).map(r => (
                  <tr key={r.source}>
                    <th scope="row">{HE.SRC_LABEL[r.source]}</th>
                    <td>{fmt(r.today)}</td>
                    <td>{fmt(r.week)}</td>
                    <td>{fmt(r.month)}</td>
                    <td>{Math.round((r.month / total) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>

          <Section>
            <TableWrap>
              <Table>
                <caption>{HE.SRC_CAMPAIGNS}</caption>
                {s.campaigns.length > 0 && (
                  <thead>
                    <tr>
                      <th scope="col">{HE.SRC_COL_CAMPAIGN}</th>
                      <th scope="col">{HE.SRC_COL_UTM}</th>
                      <th scope="col">{HE.SRC_COL_WEEK}</th>
                      <th scope="col">{HE.SRC_COL_MONTH}</th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {s.campaigns.map(c => (
                    <tr key={`${c.utmSource}|${c.utmCampaign}`}>
                      <th scope="row"><bdi>{c.utmCampaign || HE.SRC_NONE}</bdi></th>
                      <TextCell><bdi>{utmLabel(c.utmSource)}</bdi></TextCell>
                      <td>{fmt(c.week)}</td>
                      <td>{fmt(c.month)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
            {s.campaigns.length === 0 && <Note>{HE.SRC_NO_CAMPAIGNS}</Note>}
          </Section>
        </Stack>
      )}
      <Note>{HE.SRC_NOTE}</Note>
    </Card>
  );
}
