'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { PrayerService } from '@/lib/siddur';
import type { PrayerDay } from '@/lib/siddur/calendar';
import { todaySpecials, occasionLabels } from '@/lib/siddur/today';
import { formatHebrewDate } from '@/lib/hebrewDate';

const Box = styled.section`display: flex; flex-direction: column; gap: ${theme.spacing.ms};`;

const DateLine = styled.div`display: flex; align-items: center; flex-wrap: wrap; gap: ${theme.spacing.sm};`;

const DateText = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.primary};
  svg { color: ${theme.colors.secondary}; }
`;

const Tag = styled.span`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; border-radius: 999px; padding: 3px 10px;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.secondary};
`;

/* Quiet facts about today, separated by middots. */
const Facts = styled.p`
  display: flex; flex-wrap: wrap; gap: 0 ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};
  span + span::before { content: '·'; margin-inline-end: ${theme.spacing.sm}; color: ${theme.colors.textLight}; }
`;

const Specials = styled.div`display: flex; flex-direction: column; gap: 6px;`;

const Label = styled.span`font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.textMuted};`;

const Jumps = styled.div`display: flex; flex-wrap: wrap; gap: 6px;`;

const Jump = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  min-height: 34px; padding: 0 14px; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.primary};
  background: color-mix(in srgb, ${theme.colors.secondary} 12%, transparent);
  border: 1px solid color-mix(in srgb, ${theme.colors.secondary} 45%, transparent);
  transition: background ${theme.motion.fast}, transform ${theme.motion.fast};
  &:hover { background: color-mix(in srgb, ${theme.colors.secondary} 22%, transparent); }
  &:active { transform: scale(0.97); }
`;

interface Props {
  service: PrayerService;
  day: PrayerDay;
  onJump: (anchor: string) => void;
}

/** What today changes in this service — occasions, tachanun, and quick jumps to the inserts. */
export default function TodayStrip({ service, day, onJump }: Props) {
  const specials = todaySpecials(service, day);
  const occasions = occasionLabels(day);
  const facts = [
    service.id !== 'arvit' && (day.tachanun ? HE.SIDDUR_TACHANUN_SAID : HE.SIDDUR_TACHANUN_NOT(day.noTachanunReason ?? '')),
    day.occasions.has('winter') ? HE.SIDDUR_RAIN_WINTER : HE.SIDDUR_RAIN_SUMMER,
    specials.length === 0 && HE.SIDDUR_TODAY_ORDINARY,
  ].filter((f): f is string => Boolean(f));

  return (
    <Box aria-label={HE.SIDDUR_TODAY_SPECIAL}>
      <DateLine>
        <DateText><LineIcon name="calendar" size={17} />{service.id === 'arvit' ? `${HE.SIDDUR_TONIGHT} · ` : ''}{formatHebrewDate(day.at)}</DateText>
        {occasions.map(o => <Tag key={o}>{o}</Tag>)}
      </DateLine>
      <Facts>{facts.map(f => <span key={f}>{f}</span>)}</Facts>
      {specials.length > 0 && (
        <Specials>
          <Label>{HE.SIDDUR_TODAY_SPECIAL}</Label>
          <Jumps>{specials.map(s => <Jump key={s.anchor} onClick={() => onJump(s.anchor)}>{s.label}</Jump>)}</Jumps>
        </Specials>
      )}
    </Box>
  );
}
