'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Audience, MikvehFilter } from '@/lib/mikveh/filter';
import { Chip, Muted } from '@/components/MinyanView/minyanStyles';

const Bar = styled.div`display: flex; flex-direction: column; gap: 6px;`;

const Row = styled.div`
  display: flex; align-items: center; gap: 6px; overflow-x: auto;
  scrollbar-width: none; &::-webkit-scrollbar { display: none; }
`;

const Sep = styled.span`width: 1px; height: 22px; background: ${theme.colors.border}; flex-shrink: 0; margin: 0 2px;`;

/* Colour dot matching the marker tone, so the chips double as the map legend. */
const Dot = styled.span<{ $c: string }>`
  width: 9px; height: 9px; border-radius: 50%; background: ${p => p.$c};
  display: inline-block; margin-inline-end: 6px; vertical-align: middle;
  box-shadow: 0 0 0 1.5px ${theme.colors.surface};
`;

const AUDIENCES: { key: Audience; label: string; dot?: string }[] = [
  { key: 'all', label: HE.MK_FILTER_ALL },
  { key: 'women', label: HE.MK_FILTER_WOMEN, dot: theme.colors.accent },
  { key: 'men', label: HE.MK_FILTER_MEN, dot: theme.colors.primary },
  { key: 'vessels', label: HE.MK_FILTER_VESSELS },
];

interface Props { filter: MikvehFilter; onChange: (f: MikvehFilter) => void; count: number; }

export default function MikvehFilters({ filter, onChange, count }: Props) {
  return (
    <Bar>
      <Row role="group" aria-label={HE.MK_FILTER_LABEL}>
        {AUDIENCES.map(a => (
          <Chip key={a.key} $active={filter.audience === a.key} aria-pressed={filter.audience === a.key}
            onClick={() => onChange({ ...filter, audience: a.key })}>
            {a.dot && <Dot $c={a.dot} aria-hidden="true" />}{a.label}
          </Chip>
        ))}
        <Sep aria-hidden="true" />
        <Chip $active={filter.accessible} aria-pressed={filter.accessible}
          onClick={() => onChange({ ...filter, accessible: !filter.accessible })}>
          ♿ {HE.MK_FILTER_ACCESSIBLE}
        </Chip>
      </Row>
      <Muted role="status" aria-live="polite">{HE.MK_COUNT(count)}</Muted>
    </Bar>
  );
}
