'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { LearnKindDef } from '@/lib/dailyLearning/kinds';
import LearnChips from './LearnChips';
import type { LearnItem, LearnKind } from '@/types/dailyLearning';

const Hero = styled.header`
  position: relative; overflow: hidden; isolation: isolate;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.lg};
  border-radius: ${theme.radii.xl}; background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
  ${theme.media.sm} { padding: ${theme.spacing.ms} ${theme.spacing.md} ${theme.spacing.md}; border-radius: ${theme.radii.lg}; }
  &::before {
    content: ''; position: absolute; inset: 0 0 auto; height: 3px;
    background: linear-gradient(90deg, transparent, ${theme.colors.secondary}, transparent);
  }
`;

const Watermark = styled.span`
  position: absolute; z-index: -1; top: -26px; inset-inline-end: -22px;
  color: ${theme.colors.secondary}; opacity: 0.08; pointer-events: none;
`;

const TopRow = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;

const Back = styled(Link)`
  display: inline-flex; align-items: center; min-height: 36px; padding: 0 ${theme.spacing.sm};
  margin-inline-start: -${theme.spacing.sm}; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.textMuted};
  &:hover { color: ${theme.colors.primary}; background: ${theme.colors.surfaceAlt}; }
`;

const FontCtl = styled.div`
  display: inline-flex; border-radius: 999px; overflow: hidden;
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.background};
`;

const FontBtn = styled.button<{ $big?: boolean }>`
  min-width: 42px; height: 36px; display: flex; align-items: center; justify-content: center;
  font-family: ${theme.fonts.body}; font-weight: 700; line-height: 1;
  font-size: ${p => p.$big ? theme.fontSizes.xl : theme.fontSizes.sm}; color: ${theme.colors.text};
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
const Kicker = styled.span`font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.textMuted}; letter-spacing: 0.02em;`;
const Title = styled.h1`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.display}; line-height: 1.1; font-weight: 800; color: ${theme.colors.primary};
  ${theme.media.sm} { font-size: ${theme.fontSizes.h1}; }
`;
const Ref = styled.span`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 600; color: ${theme.colors.secondary};`;

const Toggle = styled.button<{ $on: boolean }>`
  align-self: flex-start; display: inline-flex; align-items: center; gap: 8px;
  min-height: 38px; padding: 0 14px; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 700;
  color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.primary};
  background: ${p => p.$on ? theme.colors.primary : 'transparent'};
  border: 1px solid ${p => p.$on ? theme.colors.primary : theme.colors.border};
  transition: background ${theme.motion.base} ${theme.motion.out}, color ${theme.motion.fast};
`;

interface Props {
  def: LearnKindDef;
  heRef: string | null;
  items: LearnItem[];
  isDone: (k: LearnKind) => boolean;
  explain: boolean;
  onExplain: () => void;
  font: { canShrink: boolean; canGrow: boolean; smaller: () => void; larger: () => void };
}

/** Reader top: back, text size, the cycle and today's ref, Steinsaltz toggle, other cycles. */
export default function LearnHeader({ def, heRef, items, isDone, explain, onExplain, font }: Props) {
  return (
    <Hero>
      <Watermark aria-hidden><LineIcon name={def.icon} size={150} strokeWidth={1.2} /></Watermark>
      <TopRow>
        <Back href="/today">{HE.LEARN_BACK}</Back>
        <FontCtl role="group" aria-label={HE.SIDDUR_FONT_ARIA}>
          <FontBtn onClick={font.smaller} disabled={!font.canShrink} aria-label={HE.SIDDUR_FONT_SMALLER} title={HE.SIDDUR_FONT_SMALLER}>{HE.SIDDUR_FONT_GLYPH}</FontBtn>
          <FontBtn $big onClick={font.larger} disabled={!font.canGrow} aria-label={HE.SIDDUR_FONT_LARGER} title={HE.SIDDUR_FONT_LARGER}>{HE.SIDDUR_FONT_GLYPH}</FontBtn>
        </FontCtl>
      </TopRow>
      <TitleRow>
        <Emblem><LineIcon name={def.icon} size={28} strokeWidth={1.7} /></Emblem>
        <Titles>
          <Kicker>{HE.LEARN_TODAY_LABEL}</Kicker>
          <Title>{def.label}</Title>
          {heRef && <Ref>{heRef}</Ref>}
        </Titles>
      </TitleRow>
      {def.explain && (
        <Toggle $on={explain} aria-pressed={explain} aria-label={HE.LEARN_EXPLAIN_ARIA} onClick={onExplain}>
          <LineIcon name="bulb" size={17} strokeWidth={1.8} />{HE.LEARN_EXPLAIN}
        </Toggle>
      )}
      {items.length > 1 && <LearnChips items={items} active={def.kind} isDone={isDone} />}
    </Hero>
  );
}
