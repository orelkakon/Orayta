'use client';

import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/rabbisData';
import type { useDragReorder } from './useDragReorder';
import { popIn } from '../quizChrome';

const Wrap = styled.div`display: grid; grid-template-columns: auto 1fr; gap: ${theme.spacing.sm};`;
const Rail = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: ${theme.spacing.xs} 0; font-size: 0.68rem; font-weight: 700; color: ${theme.colors.textMuted};
  &::before { content: ''; order: 1; flex: 1; width: 2px; margin: ${theme.spacing.xs} 0; border-radius: 2px;
    background: linear-gradient(${theme.colors.secondary}, ${theme.colors.primaryLight}); opacity: 0.55; }
  span:last-child { order: 2; }
`;
const List = styled.ol`
  list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  user-select: none; -webkit-user-select: none;
`;
type Mark = 'ok' | 'bad' | null;
const Item = styled.li<{ $lifted: boolean; $selected: boolean; $mark: Mark; $color: string }>`
  position: relative; display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.ms} ${theme.spacing.md}; min-height: 64px;
  background: ${theme.colors.surface}; border-radius: ${theme.radii.md};
  border: 2px solid ${({ $mark, $selected, $color }) =>
    $mark === 'ok' ? theme.colors.success : $mark === 'bad' ? theme.colors.error : $selected ? $color : theme.colors.borderLight};
  box-shadow: ${({ $lifted }) => ($lifted ? theme.shadows.lg : theme.shadows.sm)};
  -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; cursor: grab; outline: none;
  will-change: transform; transition: box-shadow ${theme.motion.base} ease, border-color ${theme.motion.fast} ease;
  ${({ $lifted }) => $lifted && css`cursor: grabbing;`}
  &:focus-visible { box-shadow: 0 0 0 3px ${theme.colors.accentLight}, ${theme.shadows.sm}; }
`;
const Pos = styled.span<{ $color: string }>`
  flex: none; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
  font-size: 0.85rem; font-weight: 800; color: ${theme.colors.onPrimary};
  background: ${({ $color }) => $color};
`;
const Body = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;`;
const Name = styled.span`font-family: ${theme.fonts.body}; font-size: 1.05rem; font-weight: 700; color: ${theme.colors.text}; line-height: 1.3;`;
const Meta = styled.span`
  display: flex; flex-wrap: wrap; align-items: center; gap: ${theme.spacing.xs};
  font-size: 0.76rem; color: ${theme.colors.textMuted}; animation: ${popIn} 0.3s ${theme.motion.spring};
`;
const Badge = styled.span<{ $color: string }>`
  font-weight: 700; padding: 1px 8px; border-radius: 10px;
  background: ${({ $color }) => $color + '1F'}; color: ${({ $color }) => $color}; border: 1px solid ${({ $color }) => $color + '44'};
`;
const MarkIcon = styled.span<{ $ok: boolean }>`
  flex: none; font-size: 1.1rem; font-weight: 800; animation: ${popIn} 0.3s ${theme.motion.spring};
  color: ${({ $ok }) => ($ok ? theme.colors.success : theme.colors.error)};
`;
const Handle = styled.span`
  flex: none; display: grid; place-items: center; width: 36px; height: 44px; margin-inline-end: -${theme.spacing.xs};
  border-radius: ${theme.radii.sm}; color: ${theme.colors.textLight}; touch-action: none; cursor: grab;
  svg { display: block; }
  @media (hover: hover) { &:hover { color: ${theme.colors.primary}; background: ${theme.colors.surfaceAlt}; } }
`;

const Grip = () => (
  <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true" fill="currentColor">
    {[4, 11, 18].flatMap(y => [3, 11].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />))}
  </svg>
);

export type ChronoItem = Pick<Rabbi, 'id' | 'name' | 'sortYear' | 'category' | 'datePeriod'>;

type Drag = ReturnType<typeof useDragReorder>;

interface Props {
  items: ChronoItem[];
  order: string[];
  itemProps: Drag['itemProps'];
  draggingId: string | null;
  onKey: (id: string, e: React.KeyboardEvent) => void;
  marks: Record<string, boolean> | null;
  showCategory: boolean;
  showDates: boolean;
  selectedId: string | null;
  locked: boolean;
}

export default function ChronoList({ items, order, itemProps, draggingId, onKey, marks, showCategory, showDates, selectedId, locked }: Props) {
  const byId = new Map(items.map(i => [i.id, i]));
  // Category colour is itself a clue — neutral until the hint or the reveal.
  const colorOf = (r: ChronoItem) => (showCategory ? CATEGORY_COLORS[r.category as RabbiCategory] ?? theme.colors.primary : theme.colors.primary);

  return (
    <Wrap>
      <Rail aria-hidden="true"><span>{HE.QUIZ_CHRONO_EARLIER}</span><span>{HE.QUIZ_CHRONO_LATER}</span></Rail>
      <List aria-label={HE.QUIZ_CHRONO_LIST_ARIA}>
        {order.map((id, i) => {
          const r = byId.get(id);
          if (!r) return null;
          const mark: Mark = marks ? (marks[id] ? 'ok' : 'bad') : null;
          return (
            <Item
              key={id}
              data-chrono-id={id}
              tabIndex={0}
              aria-label={HE.QUIZ_CHRONO_ITEM_ARIA(r.name, i + 1, order.length)}
              $lifted={draggingId === id}
              $selected={selectedId === id}
              $mark={mark}
              $color={colorOf(r)}
              onKeyDown={e => onKey(id, e)}
              {...itemProps(id)}
            >
              <Pos $color={colorOf(r)} aria-hidden="true">{i + 1}</Pos>
              <Body>
                <Name>{r.name}</Name>
                {(showCategory || showDates) && (
                  <Meta>
                    {showCategory && <Badge $color={colorOf(r)}>{CATEGORY_LABELS[r.category as RabbiCategory]}</Badge>}
                    {showDates && <span>{r.datePeriod}</span>}
                  </Meta>
                )}
              </Body>
              {mark && <MarkIcon $ok={mark === 'ok'} aria-label={mark === 'ok' ? HE.QUIZ_CHRONO_POS_OK : HE.QUIZ_CHRONO_POS_BAD}>{mark === 'ok' ? '✓' : '✗'}</MarkIcon>}
              {!locked && <Handle data-drag-handle aria-label={HE.QUIZ_CHRONO_HANDLE(r.name)} role="img"><Grip /></Handle>}
            </Item>
          );
        })}
      </List>
    </Wrap>
  );
}
