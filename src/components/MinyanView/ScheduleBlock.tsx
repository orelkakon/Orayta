'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Reliability, ScheduleText } from '@/types/minyan';
import { formatSourceDate } from '@/lib/minyan/format';
import ReliabilityBadge from './ReliabilityBadge';
import { Muted } from './minyanStyles';

const Wrap = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  padding: ${theme.spacing.sm}; border-radius: ${theme.radii.sm};
  background: ${theme.colors.surfaceAlt};
`;

const Line = styled.p`
  font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.text};
  b { color: ${theme.colors.primary}; }
`;

const Unknown = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.5;`;

/** Prayer times exactly as each source publishes them — never parsed into claims. */
export default function ScheduleBlock({ schedules, reliability }: { schedules: ScheduleText[]; reliability: Reliability | null }) {
  if (!reliability || schedules.length === 0) return <Unknown>{HE.MN_SCHED_UNKNOWN}</Unknown>;
  return (
    <Wrap>
      <ReliabilityBadge label={HE.MN_SCHED_LABEL} r={reliability} />
      {schedules.map(s => {
        const date = formatSourceDate(s.updatedAt);
        return (
          <div key={s.provider}>
            {s.weekday && <Line><b>{HE.MN_SCHED_WEEKDAY}:</b> <span dir="auto">{s.weekday}</span></Line>}
            {s.shabbat && <Line><b>{HE.MN_SCHED_SHABBAT}:</b> <span dir="auto">{s.shabbat}</span></Line>}
            {s.general && <Line><b>{HE.MN_SCHED_GENERAL}:</b> <span dir="auto">{s.general}</span></Line>}
            <Muted>
              {HE.MN_SCHED_AS_PUBLISHED(HE.MN_PROVIDERS[s.provider])}
              {' · '}{date ? HE.MN_UPDATED(date) : HE.MN_NO_DATE}
            </Muted>
          </div>
        );
      })}
    </Wrap>
  );
}
