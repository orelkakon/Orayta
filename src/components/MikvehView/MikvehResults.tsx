'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { MikvehNearbyResponse } from '@/types/mikveh';
import { formatSourceDate } from '@/lib/minyan/format';
import { DEFAULT_FILTER, MikvehFilter, filterMikvaot, mikvehTone, parseFilter } from '@/lib/mikveh/filter';
import NearbyMap, { MapPoint } from '@/components/NearbyMap/NearbyMap';
import type { Origin } from '@/components/MinyanView/useMinyanSearch';
import { Muted, Panel } from '@/components/MinyanView/minyanStyles';
import MikvehFilters from './MikvehFilters';
import MikvehCard from './MikvehCard';

const STORE_KEY = 'orayta_mikveh_filter';

const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.ms};`;
const Empty = styled(Panel)`text-align: center; display: flex; flex-direction: column; gap: 6px; padding: ${theme.spacing.xl};`;
const EmptyTitle = styled.strong`font-size: ${theme.fontSizes.lg}; color: ${theme.colors.primary};`;
const Warn = styled.p`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.text}; background: ${theme.colors.bgWarning}; padding: 6px ${theme.spacing.sm}; border-radius: ${theme.radii.sm};`;
const Attribution = styled.p`font-size: 0.68rem; color: ${theme.colors.textLight}; line-height: 1.5;`;

interface Props { data: MikvehNearbyResponse; origin: Origin; }

/** Filters + map + distance-sorted list. Town-centre pins stay off the map. */
export default function MikvehResults({ data, origin }: Props) {
  const [filter, setFilter] = useState<MikvehFilter>(DEFAULT_FILTER);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    try { setFilter(parseFilter(localStorage.getItem(STORE_KEY))); } catch { /* storage blocked */ }
  }, []);
  const changeFilter = (f: MikvehFilter) => {
    setFilter(f);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(f)); } catch { /* storage blocked */ }
  };

  const shown = useMemo(() => filterMikvaot(data.mikvaot, filter), [data.mikvaot, filter]);
  const points: MapPoint[] = shown
    .filter(m => m.precision !== 'city')
    .map(m => ({ id: m.id, lat: m.lat, lng: m.lng, label: m.name ?? HE.MK_UNNAMED, tone: mikvehTone(m), approx: m.precision !== 'exact' }));
  const offMap = shown.length - points.length;
  const gov = data.providers.find(p => p.source === 'gov');
  const govDate = formatSourceDate(gov?.updatedAt ?? null);

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <>
      {gov?.state === 'error' && <Warn role="status">{HE.MK_SOURCE_DOWN}</Warn>}
      {data.mikvaot.length === 0 ? (
        <Empty role="status"><EmptyTitle>{HE.MK_EMPTY_TITLE}</EmptyTitle><Muted>{HE.MK_EMPTY_SUB}</Muted></Empty>
      ) : (
        <>
          <MikvehFilters filter={filter} onChange={changeFilter} count={shown.length} />
          {points.length > 0 && (
            <NearbyMap center={[origin.lat, origin.lng]} radius={data.radiusM} points={points}
              selectedId={selectedId} onSelect={selectFromMap} ariaLabel={HE.MK_ARIA_MAP} youLabel={HE.MN_MAP_YOU} />
          )}
          {offMap > 0 && <Muted>{HE.MK_APPROX_NOTE(offMap)}</Muted>}
          {shown.length === 0 ? (
            <Empty role="status"><Muted>{HE.MK_EMPTY_FILTERED}</Muted></Empty>
          ) : (
            <List>
              {shown.map(m => (
                <MikvehCard
                  key={m.id}
                  ref={el => { if (el) cardRefs.current.set(m.id, el); else cardRefs.current.delete(m.id); }}
                  m={m}
                  selected={m.id === selectedId}
                  onSelect={() => setSelectedId(m.id)}
                />
              ))}
            </List>
          )}
        </>
      )}
      <Attribution>{HE.MK_ATTRIBUTION}{govDate ? HE.MK_ATTRIBUTION_DATE(govDate) : ''}</Attribution>
    </>
  );
}
