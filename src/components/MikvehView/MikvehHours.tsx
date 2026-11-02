'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { MikvehHours as Hours } from '@/types/mikveh';
import { isIsraelSummer } from '@/lib/mikveh/merge';

const Box = styled.div`
  background: ${theme.colors.surfaceAlt}; border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.ms};
  display: flex; flex-direction: column; gap: 4px;
`;

const Head = styled.span`font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.textMuted};`;

const Line = styled.p<{ $now?: boolean }>`
  font-size: ${p => (p.$now ? theme.fontSizes.md : theme.fontSizes.sm)};
  font-weight: ${p => (p.$now ? 700 : 400)};
  color: ${p => (p.$now ? theme.colors.primary : theme.colors.text)};
  line-height: 1.5;
  b { font-weight: 700; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.xs}; margin-inline-end: 6px; }
`;

const NowTag = styled.b`
  && { color: ${theme.colors.onPrimary}; background: ${theme.colors.success}; border-radius: ${theme.radii.xl}; padding: 1px 8px; }
`;

const Unknown = styled.p`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; line-height: 1.6;`;

/** Hours verbatim; the season in effect now (Israel summer/winter time) comes first and stands out. */
export default function MikvehHours({ hours }: { hours: Hours | null }) {
  // Decided after mount so server and client render the same markup.
  const [summer, setSummer] = useState<boolean | null>(null);
  useEffect(() => { setSummer(isIsraelSummer()); }, []);

  if (!hours) return <Unknown>{HE.MK_HOURS_UNKNOWN}</Unknown>;

  const seasons = [
    { key: 'summer', label: HE.MK_SEASON_SUMMER, text: hours.summer, now: summer === true },
    { key: 'winter', label: HE.MK_SEASON_WINTER, text: hours.winter, now: summer === false },
  ].filter(s => s.text).sort((a, b) => Number(b.now) - Number(a.now));
  // Identical summer/winter text reads as one line.
  const same = seasons.length === 2 && seasons[0].text === seasons[1].text;

  return (
    <Box>
      <Head>{HE.MK_HOURS} · {HE.MK_HOURS_NOTE}</Head>
      {same ? (
        <Line $now>{seasons[0].text}</Line>
      ) : seasons.map(s => (
        <Line key={s.key} $now={s.now}>
          {s.now ? <NowTag>{HE.MK_HOURS_NOW(s.label)}</NowTag> : <b>{s.label}</b>}
          {s.text}
        </Line>
      ))}
      {hours.shabbat && <Line><b>{HE.MK_HOURS_SHABBAT}</b>{hours.shabbat}</Line>}
      {hours.general && <Line><b>{HE.MK_HOURS_GENERAL}</b><span dir="ltr">{hours.general}</span></Line>}
    </Box>
  );
}
