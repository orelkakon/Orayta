'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { omerCount } from '@/lib/omer';
import { dayToLetters } from '@/lib/hebrewDate';
import { useOmerNow, useOmerLog } from '@/components/OmerView/useOmer';

const Card = styled(Link)`
  display: flex; align-items: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg}; border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface}; box-shadow: ${theme.shadows.md};
  border: 1px solid color-mix(in srgb, ${theme.colors.secondary} 40%, transparent);
  transition: transform ${theme.motion.fast}, box-shadow ${theme.motion.fast};
  &:hover { box-shadow: ${theme.shadows.lg}; }
  &:active { transform: scale(0.98); }
`;
const Num = styled.span`
  width: 56px; height: 56px; flex-shrink: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: ${theme.fonts.body}; font-size: 1.5rem; font-weight: 800; color: ${theme.colors.primary};
  border: 3px solid ${theme.colors.secondary}; background: ${theme.colors.surfaceAlt};
`;
const Texts = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;
const Label = styled.span`font-size: 0.75rem; font-weight: 600; color: ${theme.colors.textMuted};`;
const Day = styled.span`font-family: ${theme.fonts.body}; font-size: 1.15rem; font-weight: 700; color: ${theme.colors.primary};`;
const Sefira = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.secondary}; font-weight: 600;`;
const Cta = styled.span<{ $done: boolean }>`
  flex-shrink: 0; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  color: ${p => p.$done ? theme.colors.success : theme.colors.secondary};
`;

/** Only during the Omer: tonight's count, its sefira, and whether it was ticked off. */
export default function OmerTodayCard() {
  const omer = useOmerNow();
  const s = omer?.status;
  const focus = s ? s.tonight ?? s.today : null;
  const markDay = s ? (s.isNight ? s.tonight : s.today) : null;
  const log = useOmerLog(markDay);
  const c = focus ? omerCount(focus) : null;
  if (!s || !c) return null;
  const done = markDay !== null && log.counted.includes(markDay) && s.isNight;
  return (
    <Card href="/omer">
      <Num aria-hidden>{dayToLetters(c.day)}</Num>
      <Texts>
        <Label>{s.isNight ? HE.OMER_KICKER_NIGHT : HE.OMER_KICKER_DAY}</Label>
        <Day>{HE.OMER_DAY_N(c.day)}</Day>
        <Sefira>{c.sefira}</Sefira>
      </Texts>
      <Cta $done={done}>{done ? HE.OMER_CARD_DONE : `${HE.OMER_CARD_OPEN} ‹`}</Cta>
    </Card>
  );
}
