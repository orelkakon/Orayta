'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

interface ShabbatTimesItem { category: string; date: string; }
interface ShabbatTimesResp { items?: ShabbatTimesItem[]; }
interface CityTimes { label: string; candles: string; havdalah: string; }

// Hebcal geonameids; Jerusalem automatically gets its 40-minute candle-lighting custom.
const CITIES = [
  { geonameid: 293397, label: HE.TODAY_SHABBAT_TLV },
  { geonameid: 281184, label: HE.TODAY_SHABBAT_JLM },
];

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

// ISO from Hebcal already carries the local offset ("…T17:47:00+03:00") — take HH:MM verbatim.
const hhmm = (iso: string | undefined) => iso?.slice(11, 16) ?? '';

export default function ShabbatTimes({ date }: { date: string }) {
  const [times, setTimes] = useState<CityTimes[]>([]);

  useEffect(() => {
    const [y, m, d] = date.split('-').map(Number);
    void Promise.all(CITIES.map(c =>
      fetch(`https://www.hebcal.com/shabbat?cfg=json&geonameid=${c.geonameid}&gy=${y}&gm=${m}&gd=${d}`)
        .then(r => r.json() as Promise<ShabbatTimesResp>)
        .then(sh => ({
          label: c.label,
          candles: hhmm(sh.items?.find(i => i.category === 'candles')?.date),
          havdalah: hhmm(sh.items?.find(i => i.category === 'havdalah')?.date),
        }))
    )).then(res => setTimes(res.filter(t => t.candles && t.havdalah))).catch(() => {});
  }, [date]);

  if (!times.length) return null;
  return (
    <Wrap>
      {times.map(t => (
        <span key={t.label}>
          <City>{t.label}:</City> {HE.TODAY_SHABBAT_IN} <Time>{t.candles}</Time> · {HE.TODAY_SHABBAT_OUT} <Time>{t.havdalah}</Time>
        </span>
      ))}
    </Wrap>
  );
}
