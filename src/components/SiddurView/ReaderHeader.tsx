'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { PrayerService } from '@/lib/siddur';
import type { PrayerDay } from '@/lib/siddur/calendar';
import TodayStrip from './TodayStrip';

const Hero = styled.header`
  position: relative; overflow: hidden; isolation: isolate;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md}; padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.lg};
  border-radius: ${theme.radii.xl}; background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
  ${theme.media.sm} { padding: ${theme.spacing.ms} ${theme.spacing.md} ${theme.spacing.md}; border-radius: ${theme.radii.lg}; }
  /* Gold hairline along the top edge. */
  &::before {
    content: ''; position: absolute; inset: 0 0 auto; height: 3px;
    background: linear-gradient(90deg, transparent, ${theme.colors.secondary}, transparent);
  }
`;

/* The service's icon, large and faint behind the corner of the card. */
const Watermark = styled.span`
  position: absolute; z-index: -1; top: -26px; inset-inline-end: -22px;
  color: ${theme.colors.secondary}; opacity: 0.08; pointer-events: none;
`;

const TopRow = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;

const Back = styled(Link)`
  display: inline-flex; align-items: center; min-height: 36px; padding: 0 ${theme.spacing.sm};
  margin-inline-start: -${theme.spacing.sm}; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.textMuted};
  transition: color ${theme.motion.fast}, background ${theme.motion.fast};
  &:hover { color: ${theme.colors.primary}; background: ${theme.colors.surfaceAlt}; }
`;

const FontCtl = styled.div`
  display: inline-flex; border-radius: 999px; overflow: hidden;
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.background};
`;

const FontBtn = styled.button<{ $big?: boolean }>`
  min-width: 42px; height: 36px; display: flex; align-items: center; justify-content: center;
  font-family: ${theme.fonts.body}; font-weight: 700; line-height: 1;
  font-size: ${p => p.$big ? theme.fontSizes.xl : theme.fontSizes.sm};
  color: ${theme.colors.text};
  transition: color ${theme.motion.fast}, background ${theme.motion.fast};
  & + & { border-inline-start: 1px solid ${theme.colors.borderLight}; }
  &:hover:not(:disabled) { color: ${theme.colors.primary}; background: ${theme.colors.surfaceAlt}; }
  &:disabled { opacity: 0.35; }
`;

const TitleRow = styled.div`display: flex; align-items: center; gap: ${theme.spacing.ms};`;

const Emblem = styled.span`
  width: 56px; height: 56px; flex-shrink: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary}; background: ${theme.colors.surfaceAlt};
  border: 1px solid color-mix(in srgb, ${theme.colors.secondary} 35%, transparent);
  ${theme.media.sm} { width: 48px; height: 48px; }
`;

const Titles = styled.div`display: flex; flex-direction: column; gap: 2px; min-width: 0;`;

const Title = styled.h1`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.display}; line-height: 1.1;
  font-weight: 800; color: ${theme.colors.primary};
  ${theme.media.sm} { font-size: ${theme.fontSizes.h1}; }
`;

const Nusach = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

const Divider = styled.hr`border: none; height: 1px; margin: 0; background: ${theme.colors.borderLight};`;

interface Props {
  service: PrayerService;
  day: PrayerDay | null;
  canShrink: boolean;
  canGrow: boolean;
  onSmaller: () => void;
  onLarger: () => void;
  onJump: (anchor: string) => void;
}

/** Top of a service: back link, text size, title, and what today changes. */
export default function ReaderHeader({ service, day, canShrink, canGrow, onSmaller, onLarger, onJump }: Props) {
  return (
    <Hero>
      <Watermark aria-hidden><LineIcon name={service.icon} size={150} strokeWidth={1.2} /></Watermark>
      <TopRow>
        <Back href="/siddur">{HE.SIDDUR_BACK}</Back>
        <FontCtl role="group" aria-label={HE.SIDDUR_FONT_ARIA}>
          <FontBtn onClick={onSmaller} disabled={!canShrink} aria-label={HE.SIDDUR_FONT_SMALLER} title={HE.SIDDUR_FONT_SMALLER}>{HE.SIDDUR_FONT_GLYPH}</FontBtn>
          <FontBtn $big onClick={onLarger} disabled={!canGrow} aria-label={HE.SIDDUR_FONT_LARGER} title={HE.SIDDUR_FONT_LARGER}>{HE.SIDDUR_FONT_GLYPH}</FontBtn>
        </FontCtl>
      </TopRow>
      <TitleRow>
        <Emblem><LineIcon name={service.icon} size={28} strokeWidth={1.7} /></Emblem>
        <Titles>
          <Title>{service.title}</Title>
          <Nusach>{HE.SIDDUR_NUSACH}</Nusach>
        </Titles>
      </TitleRow>
      {day && <><Divider /><TodayStrip service={service} day={day} onJump={onJump} /></>}
    </Hero>
  );
}
