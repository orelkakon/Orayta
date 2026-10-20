'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { PrayerService } from '@/lib/siddur';
import type { PrayerDay } from '@/lib/siddur/calendar';
import { todaySpecials, occasionLabels } from '@/lib/siddur/today';
import { formatHebrewDate } from '@/lib/hebrewDate';

const Box = styled.aside`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  margin: ${theme.spacing.sm} 0 ${theme.spacing.md};
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
`;

const Line = styled.div`display: flex; align-items: center; flex-wrap: wrap; gap: 6px;`;

const DateText = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.primary};
  margin-inline-end: ${theme.spacing.xs};
  svg { color: ${theme.colors.secondary}; }
`;

const Tag = styled.span<{ $tone: 'gold' | 'plain' | 'muted' }>`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; border-radius: 999px; padding: 3px 10px;
  color: ${p => p.$tone === 'gold' ? theme.colors.onPrimary : p.$tone === 'muted' ? theme.colors.textMuted : theme.colors.primary};
  background: ${p => p.$tone === 'gold' ? theme.colors.secondary : theme.colors.surfaceAlt};
`;

const Label = styled.span`font-size: ${theme.fontSizes.xs}; font-weight: 600; color: ${theme.colors.textMuted};`;

const Jump = styled.button`
  min-height: 34px; padding: 0 12px; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.secondary}; background: transparent;
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

const Ordinary = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

interface Props {
  service: PrayerService;
  day: PrayerDay;
  onJump: (anchor: string) => void;
}

/** What today changes in this service — occasions, tachanun, and quick jumps to the inserts. */
export default function TodayStrip({ service, day, onJump }: Props) {
  const specials = todaySpecials(service, day);
  const occasions = occasionLabels(day);
  const showTachanun = service.id !== 'arvit';

  return (
    <Box aria-label={HE.SIDDUR_TODAY_SPECIAL}>
      <Line>
        <DateText><LineIcon name="calendar" size={16} />{service.id === 'arvit' ? `${HE.SIDDUR_TONIGHT} · ` : ''}{formatHebrewDate(day.at)}</DateText>
        {occasions.map(o => <Tag key={o} $tone="gold">{o}</Tag>)}
        {showTachanun && (
          <Tag $tone={day.tachanun ? 'plain' : 'muted'}>
            {day.tachanun ? HE.SIDDUR_TACHANUN_SAID : HE.SIDDUR_TACHANUN_NOT(day.noTachanunReason ?? '')}
          </Tag>
        )}
        <Tag $tone="plain">{day.occasions.has('winter') ? HE.SIDDUR_RAIN_WINTER : HE.SIDDUR_RAIN_SUMMER}</Tag>
      </Line>
      <Line>
        {specials.length > 0
          ? <><Label>{HE.SIDDUR_TODAY_SPECIAL}:</Label>{specials.map(s => <Jump key={s.anchor} onClick={() => onJump(s.anchor)}>{s.label}</Jump>)}</>
          : <Ordinary>{HE.SIDDUR_TODAY_ORDINARY}</Ordinary>}
      </Line>
    </Box>
  );
}
