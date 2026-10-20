'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PrayerSection, PrayerPart, PartCondition } from '@/lib/siddur';
import { sliceSegments, markAnchor } from '@/lib/siddur';
import { conditionApplies, showWeekdayPart, EVERYDAY, PrayerDay } from '@/lib/siddur/calendar';
import PrayerText from './PrayerText';
import ConditionalPart from './ConditionalPart';

const Section = styled.section`
  padding: ${theme.spacing.lg} 0 ${theme.spacing.md};
  & + & { border-top: 1px solid ${theme.colors.borderLight}; }
`;

const Title = styled.h2<{ $muted: boolean }>`
  scroll-margin-top: var(--siddur-offset, 180px);
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h2}; font-weight: 800;
  color: ${p => p.$muted ? theme.colors.textMuted : theme.colors.primary}; margin: 0 0 ${theme.spacing.xs};
  &::after { content: ''; flex: 1; min-width: 24px; height: 1px; background: linear-gradient(to left, ${theme.colors.secondary}66, transparent); }
`;

const Badge = styled.span<{ $on: boolean }>`
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.xs}; font-weight: 700; border-radius: 999px; padding: 2px 9px;
  color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.textMuted};
  background: ${p => p.$on ? theme.colors.secondary : theme.colors.surfaceAlt};
`;

const Note = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; margin: 0 0 ${theme.spacing.sm};`;

const Mark = styled.h3`
  scroll-margin-top: var(--siddur-offset, 180px);
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  letter-spacing: 0.02em; color: ${theme.colors.secondary};
  margin: ${theme.spacing.md} 0 ${theme.spacing.xs};
`;

const SmallBtn = styled.button`
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.secondary};
  padding: 6px 12px; min-height: 36px; border-radius: 999px;
  border: 1px solid ${theme.colors.border};
  &:hover { border-color: ${theme.colors.secondary}; }
`;

const shimmer = keyframes`0%, 100% { opacity: 0.5; } 50% { opacity: 1; }`;
const Skeleton = styled.div`
  display: flex; flex-direction: column; gap: 10px; padding: ${theme.spacing.sm} 0;
  span { height: 14px; border-radius: 7px; background: ${theme.colors.surfaceAlt}; animation: ${shimmer} 1.4s ease-in-out infinite; }
  span:nth-child(2) { width: 92%; } span:nth-child(3) { width: 70%; }
  @media (prefers-reduced-motion: reduce) { span { animation: none; } }
`;

const Failed = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

interface Props {
  section: PrayerSection;
  nodes: Record<string, string[]>;
  loading: boolean;
  day: PrayerDay | null;
}

/** "Not today" explanation — tachanun names the reason (ראש חודש, ניסן…). */
function noteFor(when: PartCondition | undefined, fallback: string | undefined, applies: boolean, day: PrayerDay): string | undefined {
  if (when === 'tachanun' && !applies && day.noTachanunReason) return HE.SIDDUR_NO_TACHANUN_TODAY(day.noTachanunReason);
  return fallback;
}

export default function PrayerSectionView({ section, nodes, loading, day }: Props) {
  const [allDays, setAllDays] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const head = (muted: boolean, badge?: { on: boolean; text: string }) => (
    <Title id={section.id} $muted={muted}>
      {section.title}
      {badge && <Badge $on={badge.on}>{badge.text}</Badge>}
    </Title>
  );

  if (loading || !day) {
    return <Section>{head(false)}<Skeleton aria-hidden><span /><span /><span /></Skeleton></Section>;
  }

  const renderPart = (part: PrayerPart, i: number) => {
    if (!showWeekdayPart(part, day, allDays)) return null;
    const applies = conditionApplies(part.when, day);
    if (part.only && !applies) return null;
    const text = <PrayerText paragraphs={sliceSegments(nodes, part)} />;
    const anchorId = markAnchor(section.id, i);
    if (!part.when || (applies && EVERYDAY.has(part.when))) {
      return <div key={i}>{part.mark && <Mark id={anchorId}>{part.mark}</Mark>}{text}</div>;
    }
    return (
      <ConditionalPart key={i} id={anchorId} title={part.mark ?? section.title} applies={applies}
        note={noteFor(part.when, part.note, applies, day)}>
        {text}
      </ConditionalPart>
    );
  };

  const missing = section.parts.every(p => !nodes[p.node]);
  const body = missing ? <Failed>{HE.SIDDUR_LOAD_ERROR}</Failed> : section.parts.map(renderPart);
  const hasWeekdays = section.parts.some(p => p.weekday !== undefined) && day.weekday !== 6;
  const applies = conditionApplies(section.when, day);
  const special = Boolean(section.when) && !EVERYDAY.has(section.when as PartCondition);

  // A whole section that isn't said today folds behind its heading.
  if (!applies) {
    return (
      <Section aria-labelledby={section.id}>
        {head(true, { on: false, text: HE.SIDDUR_NOT_TODAY })}
        <Note>{noteFor(section.when, section.note, false, day)}</Note>
        <SmallBtn onClick={() => setGateOpen(o => !o)} aria-expanded={gateOpen}>{gateOpen ? HE.SIDDUR_HIDE : HE.SIDDUR_SHOW}</SmallBtn>
        {gateOpen && body}
      </Section>
    );
  }

  return (
    <Section aria-labelledby={section.id}>
      {head(false, special ? { on: true, text: HE.SIDDUR_SAID_TODAY } : undefined)}
      {section.note && <Note>{section.note}</Note>}
      {hasWeekdays && (
        <SmallBtn onClick={() => setAllDays(v => !v)} aria-pressed={allDays}>
          {allDays ? HE.SIDDUR_TODAY_ONLY : HE.SIDDUR_ALL_DAYS}
        </SmallBtn>
      )}
      {body}
    </Section>
  );
}
