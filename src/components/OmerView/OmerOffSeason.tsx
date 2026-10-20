'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { nextOmerStart } from '@/lib/omer';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { israelDateKey } from '@/lib/dailyLearning/kinds';

const Box = styled.div`display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm}; text-align: center;`;
const Kicker = styled.p`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.textMuted};`;
const Headline = styled.h2`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h2}; font-weight: 800; color: ${theme.colors.primary};`;
const When = styled.p`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${theme.colors.secondary}; font-weight: 700;`;
const Countdown = styled.span`
  padding: 4px 14px; border-radius: 999px; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.secondary};
`;
const Body = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; max-width: 420px; line-height: 1.7;`;

const dayNum = (d: Date) => {
  const [y, m, dd] = israelDateKey(d).split('-').map(Number);
  return Date.UTC(y, m - 1, dd) / 86400000;
};

/** Between Shavuot and Pesach: when the next count begins (evening of 15 Nisan). */
export default function OmerOffSeason({ now }: { now: Date }) {
  const start = nextOmerStart(now);
  if (!start) return null;
  const civil = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(start);
  const days = dayNum(start) - dayNum(now);
  return (
    <Box>
      <Kicker>{HE.OMER_OFF_TITLE}</Kicker>
      <Headline>{HE.OMER_OFF_HEADLINE}</Headline>
      <When>{HE.OMER_OFF_DATE(formatHebrewDate(start, true), civil)}</When>
      <Countdown>{HE.OMER_OFF_COUNTDOWN(days)}</Countdown>
      <Body>{HE.OMER_OFF_BODY}</Body>
    </Box>
  );
}
