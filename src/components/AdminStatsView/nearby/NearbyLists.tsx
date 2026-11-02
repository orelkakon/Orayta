'use client';

import { HE } from '@/lib/hebrewTexts';
import { NEARBY_FEATURES, NearbyAdminStats } from '@/types/nearbyStats';
import { Grid, Section, SectionTitle, Bars, BarRow, BarName, Track, Fill, BarNum, Pill, Empty } from '../rabbiBot/adminBotStyles';
import { Stack, StackPart, Dot, ListRow, Hours, HourBar, HourAxis, Note, SERIES } from './nearbyStyles';

const fmt = (n: number) => n.toLocaleString('he-IL');
const areaName = (a: string) => a || HE.NS_NO_AREA;

/** Areas, coverage gaps, hours of day, radius choice and source health. */
export default function NearbyLists({ s }: { s: NearbyAdminStats }) {
  const hourMax = Math.max(1, ...s.hours);
  const peak = s.hours.indexOf(Math.max(...s.hours));
  const radii = s.features.flatMap(f => f.radii.map(r => ({ ...r, feature: f.feature })));
  const radiusMax = Math.max(1, ...radii.map(r => r.n));

  return (
    <Grid>
      <Section>
        <SectionTitle>{HE.NS_AREAS}</SectionTitle>
        <Bars>
          {s.areas.map(a => (
            <BarRow key={a.area} title={NEARBY_FEATURES.map(f => `${HE.NS_FEATURE[f]}: ${a[f]}`).join(' · ')}>
              <BarName>{areaName(a.area)}</BarName>
              <Stack>
                {NEARBY_FEATURES.map(f => a[f] > 0 && <StackPart key={f} $pct={(a[f] / a.total) * (a.total / s.areas[0].total) * 100} $c={SERIES[f]} />)}
              </Stack>
              <BarNum>{fmt(a.total)}</BarNum>
            </BarRow>
          ))}
        </Bars>
      </Section>

      <Section>
        <SectionTitle>{HE.NS_GAPS}</SectionTitle>
        <Note>{HE.NS_GAPS_HINT}</Note>
        {s.gaps.length === 0 ? <Empty>—</Empty> : (
          <Bars>
            {s.gaps.map(g => (
              <ListRow key={`${g.area}|${g.feature}`}>
                <span><Dot $c={SERIES[g.feature]} />{areaName(g.area)} · {HE.NS_FEATURE[g.feature]}</span>
                <span>{HE.NS_GAP_ROW(g.zero, g.searches)}</span>
              </ListRow>
            ))}
          </Bars>
        )}
      </Section>

      <Section>
        <SectionTitle>{HE.NS_HOURS}</SectionTitle>
        <Hours role="img" aria-label={`${HE.NS_HOURS} — ${HE.NS_HOURS_PEAK(peak)}`}>
          {s.hours.map((n, h) => <HourBar key={h} $pct={(n / hourMax) * 100} $peak={h === peak && n > 0} title={`${h}:00 · ${n}`} />)}
        </Hours>
        <HourAxis><span>0</span><span>6</span><span>12</span><span>18</span><span>23</span></HourAxis>
        {s.hours[peak] > 0 && <Note>{HE.NS_HOURS_PEAK(peak)}</Note>}
      </Section>

      <Section>
        <SectionTitle>{HE.NS_RADII}</SectionTitle>
        <Bars>
          {radii.map(r => (
            <BarRow key={`${r.feature}-${r.radiusM}`}>
              <BarName><Dot $c={SERIES[r.feature]} />{HE.NS_FEATURE[r.feature]} · {HE.NS_KM(r.radiusM)}</BarName>
              <Track><Fill $pct={(r.n / radiusMax) * 100} /></Track>
              <BarNum>{fmt(r.n)}</BarNum>
            </BarRow>
          ))}
        </Bars>
        <SectionTitle>{HE.NS_SOURCES}</SectionTitle>
        {s.sources.length === 0 ? <span><Pill>{HE.NS_SOURCES_OK}</Pill></span> : (
          <Bars>
            {s.sources.map(src => (
              <ListRow key={src.key}>
                <span>{HE.NS_SOURCE[src.key] ?? src.key}</span>
                <span><Pill $bad={!src.key.endsWith(':snapshot')}>{fmt(src.n)}</Pill></span>
              </ListRow>
            ))}
          </Bars>
        )}
      </Section>
    </Grid>
  );
}
