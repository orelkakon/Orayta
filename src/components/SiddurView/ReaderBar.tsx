'use client';

import { forwardRef, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { PrayerService } from '@/lib/siddur';
import { sectionApplies, PrayerDay } from '@/lib/siddur/calendar';

const Bar = styled.div`
  position: sticky; top: 60px; z-index: ${theme.z.sticky};
  @media (max-width: 480px) { top: 52px; }
  /* Bleed to the edges of <main> (32px padding, 16px on phones). */
  margin: 0 -${theme.spacing.xl};
  padding: 0 ${theme.spacing.xl};
  ${theme.media.sm} { margin: 0 -${theme.spacing.md}; padding: 0 ${theme.spacing.md}; }
  background: ${theme.colors.background};
  background: color-mix(in srgb, ${theme.colors.background} 92%, transparent);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  border-bottom: 1px solid ${theme.colors.borderLight};
`;

const Row = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm};`;

const Chips = styled.div`
  flex: 1; min-width: 0;
  display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;
  padding: ${theme.spacing.sm} 2px;
  scroll-padding-inline: ${theme.spacing.lg};
  &::-webkit-scrollbar { display: none; }
  /* Fade the chips out at both edges so the strip reads as scrollable. */
  -webkit-mask-image: linear-gradient(to left, transparent, #000 14px, #000 calc(100% - 14px), transparent);
  mask-image: linear-gradient(to left, transparent, #000 14px, #000 calc(100% - 14px), transparent);
`;

const Chip = styled.button<{ $on: boolean }>`
  flex-shrink: 0; min-height: 34px; padding: 0 14px; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; white-space: nowrap;
  color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.textMuted};
  background: ${p => p.$on ? theme.colors.primary : 'transparent'};
  border: 1px solid ${p => p.$on ? theme.colors.primary : theme.colors.borderLight};
  box-shadow: ${p => p.$on ? theme.shadows.sm : 'none'};
  transition: color ${theme.motion.fast}, border-color ${theme.motion.fast}, background ${theme.motion.base} ${theme.motion.out};
  &:hover { color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.primary}; }
`;

const ContentsBtn = styled.button`
  flex-shrink: 0; height: 38px; min-width: 38px; padding: 0 12px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.surface};
  transition: border-color ${theme.motion.fast};
  &:hover { border-color: ${theme.colors.secondary}; }
  ${theme.media.sm} { padding: 0; span { display: none; } }
`;

const Progress = styled.div`
  height: 2px; margin: 0 -${theme.spacing.xl};
  ${theme.media.sm} { margin: 0 -${theme.spacing.md}; }
  background: ${theme.colors.secondary};
  transform-origin: right; transition: transform 0.1s linear;
`;

interface Props {
  service: PrayerService;
  day: PrayerDay | null;
  active: string;
  progress: number;
  onJump: (id: string) => void;
  onContents: () => void;
}

/** Sticky strip while reading: section chips with scroll-spy, contents, progress. */
const ReaderBar = forwardRef<HTMLDivElement, Props>(function ReaderBar(p, ref) {
  const chipsRef = useRef<HTMLDivElement>(null);

  // Keep the active chip in view as the reader scrolls through the service.
  useEffect(() => {
    const chip = chipsRef.current?.querySelector<HTMLElement>(`[data-id="${p.active}"]`);
    chip?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [p.active]);

  return (
    <Bar ref={ref}>
      <Row>
        <Chips ref={chipsRef} role="navigation" aria-label={HE.SIDDUR_NAV_ARIA}>
          {p.service.sections.filter(s => !s.when || (p.day !== null && sectionApplies(s, p.day))).map(s => (
            <Chip key={s.id} data-id={s.id} $on={s.id === p.active} aria-current={s.id === p.active ? 'location' : undefined} onClick={() => p.onJump(s.id)}>
              {s.chip ?? s.title}
            </Chip>
          ))}
        </Chips>
        <ContentsBtn onClick={p.onContents} aria-label={HE.SIDDUR_CONTENTS_OPEN} title={HE.SIDDUR_CONTENTS}>
          <LineIcon name="list" size={19} strokeWidth={1.9} /><span>{HE.SIDDUR_CONTENTS}</span>
        </ContentsBtn>
      </Row>
      <Progress style={{ transform: `scaleX(${p.progress})` }} aria-hidden />
    </Bar>
  );
});

export default ReaderBar;
