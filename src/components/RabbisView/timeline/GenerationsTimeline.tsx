'use client';

import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Rabbi } from '@/types';
import { buildTimeline } from '@/lib/rabbisTimeline';
import { LineIcon } from '@/components/common/LineIcons';
import { Button } from '@/components/ui/Button';
import TimelineSection from './TimelineSection';

/**
 * ציר הדורות — everyone in the directory on one line, from the earliest to
 * today, with the centuries turning behind them. The rail fills with gold up
 * to the reading line as the page scrolls (scroll-driven CSS, no JS; without
 * support the rail is simply a line).
 */
const fill = keyframes`from { transform: scaleY(0); }`;
const travel = keyframes`from { transform: translateY(-100%); }`;
const nudge = keyframes`0%, 100% { transform: none; } 50% { transform: translateY(5px); }`;

const Wrap = styled.div`display: flex; flex-direction: column;`;

const Cap = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
  padding: ${theme.spacing.md} 0 ${theme.spacing.lg};
`;

const CapTitle = styled.h2`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h1}; font-weight: 700; line-height: 1.15;
  color: ${theme.colors.text};
`;

const CapSub = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

const Hint = styled.p`
  display: inline-flex; align-items: center; gap: 6px; margin-top: 4px;
  font-size: ${theme.fontSizes.xs}; font-weight: 500; color: ${theme.colors.textLight};
`;

const Bob = styled.span.attrs({ className: 'anim-loop' })`
  display: grid; animation: ${nudge} 1.8s ease-in-out infinite;
`;

const Track = styled.div`
  position: relative; padding-inline-start: 30px;
  ${theme.up.md} { padding-inline-start: 0; }
`;

const Rail = styled.div`
  position: absolute; top: 0; bottom: 0; inset-inline-start: 0; width: 14px;
  overflow: clip; pointer-events: none;
  background: linear-gradient(${theme.colors.border}, ${theme.colors.border}) center / 2px 100% no-repeat;
  ${theme.up.md} { inset-inline-start: calc(50% - 7px); }
`;

const lineUp = `
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      display: block; animation-timeline: view(42% 58%);
    }
  }
`;

const Fill = styled.div`
  display: none; position: absolute; inset: 0 6px; transform-origin: top;
  background: ${theme.colors.gold};
  animation: ${fill} linear both;
  ${lineUp}
`;

const Bead = styled.div`
  display: none; position: absolute; inset: 0;
  animation: ${travel} linear both;
  ${lineUp}
  &::after {
    content: ''; position: absolute; bottom: 0; left: 2px; width: 10px; height: 10px; border-radius: 50%;
    background: ${theme.game.goldLight}; box-shadow: 0 0 0 2px ${theme.colors.gold};
  }
`;

const End = styled(Cap)`padding: ${theme.spacing.xl} 0 ${theme.spacing.lg};`;

const Verse = styled.p`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h2}; font-weight: 700;
  color: ${theme.colors.text};
`;

interface Props { rabbis: Rabbi[]; onOpen: (rabbi: Rabbi) => void }

export default function GenerationsTimeline({ rabbis, onOpen }: Props) {
  const sections = useMemo(() => buildTimeline(rabbis), [rabbis]);
  if (sections.length === 0) return null;

  const first = sections[0].items[0];
  const lastSec = sections[sections.length - 1];
  const last = lastSec.items[lastSec.items.length - 1];

  return (
    <Wrap aria-label={HE.RABBIS_TL_ARIA} role="region">
      <Cap>
        <CapTitle>{HE.RABBIS_TL_OPEN_TITLE}</CapTitle>
        <CapSub>{HE.RABBIS_TL_OPEN_SUB(rabbis.length, first.name, last.name)}</CapSub>
        <Hint>
          {HE.RABBIS_TL_SCROLL}
          <Bob aria-hidden="true"><LineIcon name="chevronDown" size={14} strokeWidth={2.2} /></Bob>
        </Hint>
      </Cap>

      <Track>
        <Rail aria-hidden="true"><Fill /><Bead /></Rail>
        {sections.map(s => <TimelineSection key={s.century} section={s} onOpen={onOpen} />)}
      </Track>

      <End>
        <Verse>{HE.RABBIS_TL_CLOSE_VERSE}</Verse>
        <CapSub>{HE.RABBIS_TL_CLOSE_SUB}</CapSub>
        <Button $variant="secondary" $size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <LineIcon name="chevronUp" size={16} strokeWidth={2.2} />{HE.RABBIS_TL_TOP}
        </Button>
      </End>
    </Wrap>
  );
}
