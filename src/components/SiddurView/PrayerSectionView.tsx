'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PrayerSection, PrayerPart } from '@/lib/siddur';
import { sliceSegments, markAnchor } from '@/lib/siddur';
import { partApplies, showWeekdayPart, PrayerDay } from '@/lib/siddur/calendar';
import PrayerText from './PrayerText';
import ConditionalPart from './ConditionalPart';

const Section = styled.section`
  padding: ${theme.spacing.lg} 0 ${theme.spacing.md};
  & + & { border-top: 1px solid ${theme.colors.borderLight}; }
`;

const Title = styled.h2`
  scroll-margin-top: var(--siddur-offset, 180px);
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h2}; font-weight: 800;
  color: ${theme.colors.primary}; margin: 0 0 ${theme.spacing.xs};
  &::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to left, ${theme.colors.secondary}66, transparent); }
`;

const Note = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; margin: 0 0 ${theme.spacing.sm};`;

const Mark = styled.h3`
  scroll-margin-top: var(--siddur-offset, 180px);
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  letter-spacing: 0.02em; color: ${theme.colors.secondary};
  margin: ${theme.spacing.md} 0 ${theme.spacing.xs};
`;

const ToggleDays = styled.button`
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
  day: PrayerDay;
}

export default function PrayerSectionView({ section, nodes, loading, day }: Props) {
  const [allDays, setAllDays] = useState(false);
  const hasWeekdays = section.parts.some(p => p.weekday !== undefined);

  const renderPart = (part: PrayerPart, i: number) => {
    if (!showWeekdayPart(part, day, allDays)) return null;
    const text = <PrayerText paragraphs={sliceSegments(nodes, part)} />;
    const anchor = part.mark ? <Mark id={markAnchor(section.id, i)}>{part.mark}</Mark> : null;
    if (part.when) {
      return (
        <ConditionalPart key={i} id={markAnchor(section.id, i)} part={part} applies={partApplies(part, day)}>
          {text}
        </ConditionalPart>
      );
    }
    return <div key={i}>{anchor}{text}</div>;
  };

  const missing = !loading && section.parts.every(p => !nodes[p.node]);

  return (
    <Section aria-labelledby={section.id}>
      <Title id={section.id}>{section.title}</Title>
      {section.note && <Note>{section.note}</Note>}
      {hasWeekdays && day.weekday !== 6 && (
        <ToggleDays onClick={() => setAllDays(v => !v)} aria-pressed={allDays}>
          {allDays ? HE.SIDDUR_TODAY_ONLY : HE.SIDDUR_ALL_DAYS}
        </ToggleDays>
      )}
      {loading
        ? <Skeleton aria-hidden><span /><span /><span /></Skeleton>
        : missing ? <Failed>{HE.SIDDUR_LOAD_ERROR}</Failed> : section.parts.map(renderPart)}
    </Section>
  );
}
