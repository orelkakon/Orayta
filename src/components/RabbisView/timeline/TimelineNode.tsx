'use client';

import { CSSProperties, memo, useId, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/rabbisData';
import { initialOf } from '@/lib/rabbisTimeline';
import { LineIcon } from '@/components/common/LineIcons';

/**
 * One person on the line: a dot on the rail and a card beside it. Phones keep
 * every card on one side; from tablets up the cards alternate around a centre
 * rail. Where the browser has scroll-driven animations the card settles in as
 * it enters the screen — only while entering, so nothing stays promoted.
 */
const settle = keyframes`from { opacity: 0; transform: translate3d(0, 22px, 0) scale(0.96); }`;
const unfold = keyframes`from { opacity: 0; transform: translateY(-4px); }`;

const Item = styled.li`
  position: relative; list-style: none; padding: 5px 0;
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      animation: ${settle} linear;
      animation-timeline: view();
      animation-range: entry 0% entry 80%;
    }
  }
  ${theme.up.md} {
    width: 50%;
    &[data-side='a'] { padding-inline-end: 34px; }
    &[data-side='b'] { margin-inline-start: 50%; padding-inline-start: 34px; }
  }
`;

const Dot = styled.i`
  position: absolute; top: 30px; inset-inline-start: -28px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--c); box-shadow: 0 0 0 3px ${theme.colors.background};
  ${theme.up.md} {
    [data-side='a'] > & { inset-inline-start: auto; inset-inline-end: -5px; }
    [data-side='b'] > & { inset-inline-start: -5px; }
  }
`;

const Card = styled.div`
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.sm};
`;

const Row = styled.button`
  width: 100%; min-height: 60px; padding: ${theme.spacing.sm} ${theme.spacing.ms};
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  text-align: start; border-radius: inherit; color: ${theme.colors.text};
  ${theme.up.md} {
    [data-side='a'] & { flex-direction: row-reverse; text-align: end; }
  }
`;

const Medal = styled.span`
  position: relative; flex: none; width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
  display: grid; place-items: center;
  background: var(--c); color: ${theme.game.goldInk};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 700;
  box-shadow: 0 0 0 2px ${theme.colors.surface}, 0 0 0 3.5px var(--c);
  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
`;

const Text = styled.span`flex: 1; min-width: 0; display: block;`;

const Name = styled.span`
  display: block; font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg};
  font-weight: 700; line-height: 1.25;
`;

const Meta = styled.span`
  display: block; margin-top: 2px;
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
  font-variant-numeric: tabular-nums;
`;

const Alive = styled.span`
  margin-inline-start: 6px; font-weight: 700; color: ${theme.colors.success};
`;

const Arrow = styled.span<{ $open: boolean }>`
  flex: none; display: grid; color: ${theme.colors.textLight};
  transform: rotate(${p => (p.$open ? 180 : 0)}deg);
  transition: transform ${theme.motion.base} ${theme.motion.outStrong};
`;

const More = styled.div`
  padding: 0 ${theme.spacing.ms} ${theme.spacing.ms};
  animation: ${unfold} 0.25s ${theme.motion.outStrong} both;
`;

const Bio = styled.p`
  font-size: ${theme.fontSizes.sm}; line-height: 1.7; color: ${theme.colors.text};
  padding-top: ${theme.spacing.sm}; border-top: 1px solid ${theme.colors.borderLight};
`;

const Open = styled.button`
  margin-top: ${theme.spacing.sm}; min-height: 36px;
  display: inline-flex; align-items: center; gap: 4px;
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.primary};
`;

interface Props { rabbi: Rabbi; side: 'a' | 'b'; onOpen: (rabbi: Rabbi) => void }

function TimelineNode({ rabbi, side, onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const id = useId();
  const cat = rabbi.category as RabbiCategory;
  const color = CATEGORY_COLORS[cat];

  return (
    <Item data-side={side} style={{ '--c': color } as CSSProperties}>
      <Dot aria-hidden="true" />
      <Card>
        <Row type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
          <Medal aria-hidden="true">
            {initialOf(rabbi.name)}
            {rabbi.imageUrl && !broken && (
              <img src={rabbi.imageUrl} alt="" width={44} height={44} loading="lazy" decoding="async" onError={() => setBroken(true)} />
            )}
          </Medal>
          <Text>
            <Name>{rabbi.name}</Name>
            <Meta>
              {rabbi.datePeriod} · {CATEGORY_LABELS[cat]}
              {rabbi.isAlive && <Alive>{HE.RABBIS_TL_ALIVE}</Alive>}
            </Meta>
          </Text>
          <Arrow $open={open} aria-hidden="true"><LineIcon name="chevronDown" size={16} /></Arrow>
        </Row>
        {open && (
          <More id={id}>
            <Bio>{rabbi.bio}</Bio>
            <Open type="button" onClick={() => onOpen(rabbi)}>
              {HE.RABBIS_TL_MORE}<LineIcon name="chevron" size={14} strokeWidth={2.2} />
            </Open>
          </More>
        )}
      </Card>
    </Item>
  );
}

export default memo(TimelineNode);
