'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SHABBAT_CITIES, cityTimes, placeCity } from '@/lib/shabbat';
import { clock } from '@/lib/shabbatClip/data';
import { MyPlace, inIsrael } from '@/lib/myPlace';

/**
 * Friday's line on "יומי": candle lighting and Shabbat's end for the
 * visitor's place and Jerusalem (Tel Aviv and Jerusalem without a place),
 * computed on the device by lib/shabbat.ts (checked against Hebcal).
 */
const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs} ${theme.spacing.lg};
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textMuted};
`;

const City = styled.span`font-weight: 600; color: ${theme.colors.text};`;

const Time = styled.span`font-variant-numeric: tabular-nums;`;

export default function ShabbatTimes({ date, place }: { date: string; place: MyPlace | null }) {
  const friday = new Date(`${date}T12:00:00+02:00`);
  const [jlm, tlv] = SHABBAT_CITIES;
  const mine = inIsrael(place) && place.name !== 'ירושלים' ? placeCity(place) : null;
  const rows = (mine ? [mine, jlm] : [tlv, jlm]).map(c => ({
    label: c.name ?? HE.SHABBAT_CITY[c.id],
    ...cityTimes(friday, c),
  }));
  return (
    <Wrap>
      {rows.map(t => (
        <span key={t.label}>
          <City>{t.label}:</City> {HE.TODAY_SHABBAT_IN} <Time>{clock(t.candles)}</Time> · {HE.TODAY_SHABBAT_OUT} <Time>{clock(t.ends)}</Time>
        </span>
      ))}
    </Wrap>
  );
}
