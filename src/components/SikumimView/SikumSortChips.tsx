'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumSortKey, SIKUM_SORT_KEYS } from '@/lib/sikum/order';

const Group = styled.div`display: flex; gap: ${theme.spacing.xs}; flex-shrink: 0;`;

const Chip = styled.button<{ $active: boolean }>`
  display: inline-flex; align-items: center; gap: 6px;
  min-height: 36px; padding: 0 12px 0 10px;
  border-radius: ${theme.radii.pill}; white-space: nowrap;
  font-size: ${theme.fontSizes.sm}; font-weight: ${p => (p.$active ? 700 : 500)};
  border: 1px solid ${p => (p.$active ? theme.colors.primary : theme.colors.border)};
  background: ${p => (p.$active ? `color-mix(in srgb, ${theme.colors.primary} 10%, transparent)` : 'transparent')};
  color: ${p => (p.$active ? theme.colors.primary : theme.colors.textMuted)};
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.16s ${theme.motion.outStrong};
  -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none;
  &:active { transform: scale(0.96); }
`;

/** The direction arrow: points down by default, turns to point up when reversed. */
const Arrow = styled.svg<{ $up: boolean; $active: boolean }>`
  width: 16px; height: 16px; flex-shrink: 0; display: block;
  opacity: ${p => (p.$active ? 1 : 0.4)};
  transform: rotate(${p => (p.$up ? 180 : 0)}deg);
  transition: transform 0.35s ${theme.motion.outStrong}, opacity 0.2s ease;
`;

const LABELS: Record<SikumSortKey, string> = { date: HE.SIKUMIM_SORT_DATE, order: HE.SIKUMIM_SORT_ORDER };

/** How the list runs for a sort and a direction, in words. */
export function directionText(by: SikumSortKey, reversed: boolean): string {
  if (by === 'date') return reversed ? HE.SIKUMIM_DIR_DATE_REV : HE.SIKUMIM_DIR_DATE;
  return reversed ? HE.SIKUMIM_DIR_ORDER_REV : HE.SIKUMIM_DIR_ORDER;
}

interface Props {
  by: SikumSortKey;
  rev: Record<SikumSortKey, boolean>;
  onPick: (by: SikumSortKey) => void;
}

export default function SikumSortChips({ by, rev, onPick }: Props) {
  return (
    <Group role="group" aria-label={HE.SIKUMIM_SORT_ARIA}>
      {SIKUM_SORT_KEYS.map(k => {
        const active = by === k;
        const dir = directionText(k, rev[k]);
        return (
          <Chip
            key={k} type="button" $active={active} aria-pressed={active}
            aria-label={active ? `${LABELS[k]}, ${dir}. ${HE.SIKUMIM_FLIP_ARIA}` : `${LABELS[k]}, ${dir}`}
            onClick={() => onPick(k)}
          >
            {LABELS[k]}
            <Arrow
              $up={rev[k]} $active={active} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <path d="M12 5v14M6 13l6 6 6-6" />
            </Arrow>
          </Chip>
        );
      })}
    </Group>
  );
}
