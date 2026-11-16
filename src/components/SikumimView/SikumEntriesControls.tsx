'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumSort, SIKUM_SORTS } from '@/lib/sikum/order';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { SortBtn } from './SikumEntriesView.styles';

export type SikumViewMode = 'list' | 'grid';
interface Pref { sort: SikumSort; view: SikumViewMode }
const DEFAULT: Pref = { sort: 'desc', view: 'list' };
const KEY = 'orayta_sikum_order';

/** The order + layout chosen for a book, remembered per book on this device. */
export function useSikumOrderPref(bookId: string) {
  const [pref, setPref] = useState<Pref>(DEFAULT);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}')[bookId] as Partial<Pref> | undefined;
      setPref({
        sort: saved?.sort && SIKUM_SORTS.includes(saved.sort) ? saved.sort : DEFAULT.sort,
        view: saved?.view === 'grid' ? 'grid' : 'list',
      });
    } catch { setPref(DEFAULT); }
  }, [bookId]);
  const update = useCallback((patch: Partial<Pref>) => {
    setPref(prev => {
      const next = { ...prev, ...patch };
      try {
        const all = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Pref>;
        localStorage.setItem(KEY, JSON.stringify({ ...all, [bookId]: next }));
      } catch {}
      return next;
    });
  }, [bookId]);
  return [pref, update] as const;
}

const Row = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;

/** Sort chips scroll sideways instead of wrapping on the narrowest phones. */
const Sorts = styled.div`
  display: flex; gap: ${theme.spacing.xs}; flex: 1; min-width: 0;
  overflow-x: auto; scrollbar-width: none; &::-webkit-scrollbar { display: none; }
  & > button { flex-shrink: 0; white-space: nowrap; padding-inline: 12px; }
`;

const Icon = styled.svg`width: 18px; height: 18px; display: block;`;

const ListIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);
const GridIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Icon>
);

const SORT_LABELS: Record<SikumSort, [string, string]> = {
  desc: [HE.SIKUMIM_SORT_DESC, HE.SIKUMIM_SORT_DESC_ARIA],
  asc: [HE.SIKUMIM_SORT_ASC, HE.SIKUMIM_SORT_ASC_ARIA],
  order: [HE.SIKUMIM_SORT_ORDER, HE.SIKUMIM_SORT_ORDER_ARIA],
};

interface Props {
  sort: SikumSort;
  view: SikumViewMode;
  onChange: (patch: Partial<Pref>) => void;
}

export default function SikumEntriesControls({ sort, view, onChange }: Props) {
  return (
    <Row>
      <Sorts role="group" aria-label={HE.SIKUMIM_SORT_ARIA}>
        {SIKUM_SORTS.map(s => (
          <SortBtn
            key={s} type="button" $active={sort === s} aria-pressed={sort === s}
            aria-label={SORT_LABELS[s][1]} title={SORT_LABELS[s][1]}
            onClick={() => onChange({ sort: s })}
          >
            {SORT_LABELS[s][0]}
          </SortBtn>
        ))}
      </Sorts>
      <SegmentedControl<SikumViewMode>
        ariaLabel={HE.SIKUMIM_VIEW_ARIA}
        value={view}
        onChange={v => onChange({ view: v })}
        options={[
          { value: 'list', label: <ListIcon />, ariaLabel: HE.SIKUMIM_VIEW_LIST },
          { value: 'grid', label: <GridIcon />, ariaLabel: HE.SIKUMIM_VIEW_GRID },
        ]}
      />
    </Row>
  );
}
