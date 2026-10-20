'use client';

import { forwardRef, useEffect, useRef } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { SERVICES } from '@/lib/siddur';
import type { PrayerService } from '@/lib/siddur';

const Bar = styled.div`
  position: sticky; top: 60px; z-index: ${theme.z.sticky};
  @media (max-width: 480px) { top: 52px; }
  /* Bleed to the edges of <main> (32px padding, 16px on phones). */
  margin: 0 -${theme.spacing.xl};
  padding: ${theme.spacing.sm} ${theme.spacing.xl} 0;
  ${theme.media.sm} { margin: 0 -${theme.spacing.md}; padding: ${theme.spacing.sm} ${theme.spacing.md} 0; }
  background: ${theme.colors.background};
  background: color-mix(in srgb, ${theme.colors.background} 92%, transparent);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  border-bottom: 1px solid ${theme.colors.borderLight};
`;

const Row = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm};`;

const Switch = styled.nav`
  display: flex; flex: 1; max-width: 380px; padding: 3px; gap: 2px;
  border-radius: 999px; background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.borderLight};
`;

const SwitchItem = styled(Link)<{ $on: boolean }>`
  flex: 1; min-height: 36px; display: flex; align-items: center; justify-content: center; gap: 6px;
  border-radius: 999px; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.textMuted};
  background: ${p => p.$on ? theme.colors.primary : 'transparent'};
  box-shadow: ${p => p.$on ? theme.shadows.sm : 'none'};
  transition: background ${theme.motion.base} ${theme.motion.out}, color ${theme.motion.fast};
  &:hover { color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.primary}; }
  ${theme.media.xs} { svg { display: none; } }
`;

const Tools = styled.div`display: flex; align-items: center; gap: 4px; margin-inline-start: auto;`;

const IconBtn = styled.button`
  min-width: 40px; height: 40px; padding: 0 8px; border-radius: ${theme.radii.md};
  display: flex; align-items: center; justify-content: center; gap: 4px;
  color: ${theme.colors.text}; font-weight: 700; font-family: ${theme.fonts.body};
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.surface};
  &:hover:not(:disabled) { border-color: ${theme.colors.secondary}; color: ${theme.colors.primary}; }
  &:disabled { opacity: 0.35; }
`;

const Chips = styled.div`
  display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;
  padding: ${theme.spacing.sm} 2px; margin: 0 -2px;
  scroll-padding-inline: ${theme.spacing.md};
  &::-webkit-scrollbar { display: none; }
`;

const Chip = styled.button<{ $on: boolean }>`
  flex-shrink: 0; min-height: 34px; padding: 0 14px; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; white-space: nowrap;
  color: ${p => p.$on ? theme.colors.primary : theme.colors.textMuted};
  background: ${p => p.$on ? theme.colors.surface : 'transparent'};
  border: 1px solid ${p => p.$on ? theme.colors.secondary : theme.colors.borderLight};
  box-shadow: ${p => p.$on ? theme.shadows.sm : 'none'};
  transition: color ${theme.motion.fast}, border-color ${theme.motion.fast}, background ${theme.motion.fast};
  &:hover { color: ${theme.colors.primary}; }
`;

const Progress = styled.div`
  height: 3px; margin: 0 -${theme.spacing.xl};
  ${theme.media.sm} { margin: 0 -${theme.spacing.md}; }
  background: ${theme.colors.secondary};
  transform-origin: right; transition: transform 0.1s linear;
`;

interface Props {
  service: PrayerService;
  active: string;
  progress: number;
  canShrink: boolean;
  canGrow: boolean;
  onSmaller: () => void;
  onLarger: () => void;
  onJump: (id: string) => void;
  onContents: () => void;
}

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
        <Switch aria-label={HE.SIDDUR_SWITCH_ARIA}>
          {SERVICES.map(s => (
            <SwitchItem key={s.id} href={`/siddur/${s.id}`} $on={s.id === p.service.id} aria-current={s.id === p.service.id ? 'page' : undefined}>
              <LineIcon name={s.icon} size={15} strokeWidth={2} />{s.title}
            </SwitchItem>
          ))}
        </Switch>
        <Tools>
          <IconBtn onClick={p.onSmaller} disabled={!p.canShrink} aria-label={HE.SIDDUR_FONT_SMALLER} title={HE.SIDDUR_FONT_SMALLER}>א-</IconBtn>
          <IconBtn onClick={p.onLarger} disabled={!p.canGrow} aria-label={HE.SIDDUR_FONT_LARGER} title={HE.SIDDUR_FONT_LARGER}>א+</IconBtn>
          <IconBtn onClick={p.onContents} aria-label={HE.SIDDUR_CONTENTS_OPEN} title={HE.SIDDUR_CONTENTS}>
            <LineIcon name="list" size={20} strokeWidth={1.9} />
          </IconBtn>
        </Tools>
      </Row>
      <Chips ref={chipsRef} role="navigation" aria-label={HE.SIDDUR_NAV_ARIA}>
        {p.service.sections.map(s => (
          <Chip key={s.id} data-id={s.id} $on={s.id === p.active} aria-current={s.id === p.active ? 'location' : undefined} onClick={() => p.onJump(s.id)}>
            {s.chip ?? s.title}
          </Chip>
        ))}
      </Chips>
      <Progress style={{ transform: `scaleX(${p.progress})` }} aria-hidden />
    </Bar>
  );
});

export default ReaderBar;
