'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { dayToLetters } from '@/lib/hebrewDate';
import { omerCount } from '@/lib/omer';

const R = 64;
const C = 2 * Math.PI * R;

const draw = keyframes`from { stroke-dashoffset: ${C}; }`;
const pop = keyframes`0% { transform: scale(0.92); } 60% { transform: scale(1.05); } 100% { transform: scale(1); }`;

const Wrap = styled.div`display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.ms}; text-align: center;`;
const Kicker = styled.p`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.textMuted}; letter-spacing: 0.02em;`;

const Ring = styled.div`
  position: relative; width: 168px; height: 168px;
  svg { position: absolute; inset: 0; transform: rotate(-90deg) scaleY(-1); }
  circle { fill: none; stroke-width: 7; }
  .track { stroke: ${theme.colors.borderLight}; }
  .bar { stroke: ${theme.colors.secondary}; stroke-linecap: round; animation: ${draw} 1.1s ${theme.motion.out}; }
  @media (prefers-reduced-motion: reduce) { .bar { animation: none; } }
`;
const Center = styled.div`
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
`;
const Letters = styled.span`
  font-family: ${theme.fonts.body}; font-size: 3.4rem; line-height: 1; font-weight: 800; color: ${theme.colors.primary};
`;
const Of = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; font-weight: 600; margin-top: 4px;`;

const DayLine = styled.h2`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h2}; font-weight: 800; color: ${theme.colors.primary};`;

const Sefira = styled.span`
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 999px;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.primary};
  background: color-mix(in srgb, ${theme.colors.secondary} 14%, transparent);
  border: 1px solid color-mix(in srgb, ${theme.colors.secondary} 45%, transparent);
  small { font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; font-weight: 600; }
`;

const Note = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.secondary}; font-weight: 700;`;

const MarkBtn = styled.button<{ $done: boolean }>`
  display: inline-flex; align-items: center; gap: 10px; margin-top: ${theme.spacing.xs};
  min-height: 52px; padding: 0 26px; border-radius: 999px; font-size: ${theme.fontSizes.lg}; font-weight: 800;
  color: ${p => p.$done ? theme.colors.success : theme.colors.onPrimary};
  background: ${p => p.$done ? theme.colors.bgSuccess : theme.colors.primary};
  border: 2px solid ${p => p.$done ? theme.colors.success : theme.colors.primary};
  box-shadow: ${p => p.$done ? 'none' : theme.shadows.md};
  animation: ${p => p.$done ? pop : 'none'} 0.35s ${theme.motion.spring};
  &:active { transform: scale(0.97); }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Streak = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondary};`;

interface Props {
  kicker: string;
  day: number;
  note: string;
  markDay: number | null;
  marked: boolean;
  streak: number;
  onMark: () => void;
}

/** The count in focus: Hebrew numeral in a 49-day progress ring, its sefira, and the check-off. */
export default function OmerHero({ kicker, day, note, markDay, marked, streak, onMark }: Props) {
  const c = omerCount(day);
  if (!c) return null;
  return (
    <Wrap>
      <Kicker>{kicker}</Kicker>
      <Ring aria-hidden>
        <svg viewBox="0 0 150 150"><circle className="track" cx="75" cy="75" r={R} />
          <circle className="bar" cx="75" cy="75" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - day / 49)} /></svg>
        <Center><Letters>{dayToLetters(day)}</Letters><Of>{HE.OMER_PROGRESS(day)}</Of></Center>
      </Ring>
      <DayLine>{HE.OMER_DAY_N(day)}</DayLine>
      <Sefira><small>{HE.OMER_SEFIRA_LABEL}</small>{c.sefira}</Sefira>
      <Note>{note}</Note>
      {markDay !== null && (
        <MarkBtn $done={marked} onClick={onMark} aria-pressed={marked} title={marked ? HE.OMER_UNMARK : undefined}>
          <LineIcon name="check" size={22} strokeWidth={2.2} />
          {marked ? HE.OMER_MARKED(markDay) : HE.OMER_MARK(markDay)}
        </MarkBtn>
      )}
      {streak > 0 && <Streak>🔥 {HE.OMER_STREAK(streak)}</Streak>}
    </Wrap>
  );
}
