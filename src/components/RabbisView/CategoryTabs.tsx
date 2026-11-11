'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Rabbi } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS } from '@/lib/rabbisData';

/** The era filter of the rabbi directory: one scrolling row, each era in its colour. */
const Scroll = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  overflow-x: auto;
  padding-bottom: ${theme.spacing.xs};
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button<{ $active: boolean; $color?: string }>`
  flex-shrink: 0;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  font-size: 0.85rem;
  font-weight: 600;
  border: 2px solid ${({ $active, $color }) =>
    $active ? ($color ?? theme.colors.primary) : theme.colors.borderLight};
  background: ${({ $active, $color }) =>
    $active ? `color-mix(in srgb, ${$color ?? theme.colors.primary} 10%, transparent)` : 'transparent'};
  color: ${({ $active, $color }) =>
    $active ? ($color ?? theme.colors.primary) : theme.colors.textMuted};
  transition: all 0.15s;
  &:hover {
    border-color: ${({ $color }) => $color ?? theme.colors.primary};
    color: ${({ $color }) => $color ?? theme.colors.primary};
  }
`;

interface Props { rabbis: Rabbi[]; value: string; onChange: (category: string) => void }

export default function CategoryTabs({ rabbis, value, onChange }: Props) {
  const countFor = (cat: string) => rabbis.filter(r => cat === 'all' || r.category === cat).length;
  return (
    <Scroll>
      <Tab $active={value === 'all'} onClick={() => onChange('all')}>
        {HE.RABBIS_FILTER_ALL} ({countFor('all')})
      </Tab>
      {CATEGORY_ORDER.map(cat => (
        <Tab key={cat} $active={value === cat} $color={CATEGORY_COLORS[cat]} onClick={() => onChange(cat)}>
          {CATEGORY_LABELS[cat]} ({countFor(cat)})
        </Tab>
      ))}
    </Scroll>
  );
}
