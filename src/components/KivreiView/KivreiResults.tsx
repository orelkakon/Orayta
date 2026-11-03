'use client';

import { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { KivreiNearbyResponse } from '@/lib/kivrei/types';
import { formatSourceDate } from '@/lib/minyan/format';
import NearbyMap, { MapPoint } from '@/components/NearbyMap/NearbyMap';
import type { Origin } from '@/components/MinyanView/useMinyanSearch';
import { Input, Muted, Panel } from '@/components/MinyanView/minyanStyles';
import KeverCard from './KeverCard';
import NearbyResultsLayout from '@/components/Nearby/NearbyResultsLayout';

const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const Empty = styled(Panel)`text-align: center; display: flex; flex-direction: column; gap: 6px; padding: ${theme.spacing.xl};`;
const EmptyTitle = styled.strong`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${theme.colors.text};`;
const Toolbar = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Filter = styled(Input)`flex: 1; min-width: 200px;`;
const Attribution = styled.p`font-size: ${theme.fontSizes.xxs}; color: ${theme.colors.textLight}; line-height: 1.6;`;

interface Props { data: KivreiNearbyResponse; origin: Origin; refreshing: boolean }

/** Nikud- and gershayim-insensitive text for the name filter. */
const norm = (s: string) => s.replace(/[\u0591-\u05C7]/g, '').replace(/״/g, '"').replace(/׳/g, "'").toLowerCase();

/** Map + name filter + distance-sorted cards. */
export default function KivreiResults({ data, origin, refreshing }: Props) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const shown = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    if (!words.length) return data.kivrei;
    return data.kivrei.filter(k => {
      const hay = norm(`${k.name} ${k.person ?? ''} ${k.rabbi?.name ?? ''}`);
      return words.every(w => hay.includes(w));
    });
  }, [data.kivrei, query]);

  const points: MapPoint[] = shown.map(k => ({ id: k.id, lat: k.lat, lng: k.lng, label: k.name, tone: 'kever' }));
  const date = formatSourceDate(data.datasetDate);

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const empty = data.kivrei.length === 0;
  const selected = shown.find(k => k.id === selectedId) ?? null;

  const toolbar = !empty && (
    <Toolbar>
      {data.kivrei.length > 3 && (
        <Filter type="search" value={query} onChange={e => setQuery(e.target.value)}
          placeholder={HE.KV_FILTER_PLACEHOLDER} aria-label={HE.KV_FILTER_PLACEHOLDER} />
      )}
      <Muted role="status" aria-live="polite">{HE.KV_COUNT(shown.length)}</Muted>
    </Toolbar>
  );

  const list = (
    <>
      {empty ? (
        <Empty role="status"><EmptyTitle>{HE.KV_EMPTY_TITLE}</EmptyTitle><Muted>{HE.KV_EMPTY_SUB}</Muted></Empty>
      ) : shown.length === 0 ? (
        <Empty role="status"><Muted>{HE.KV_FILTER_EMPTY}</Muted></Empty>
      ) : (
        <List>
          {shown.map(k => (
            <KeverCard
              key={k.id}
              ref={el => { if (el) cardRefs.current.set(k.id, el); else cardRefs.current.delete(k.id); }}
              k={k}
              selected={k.id === selectedId}
              onSelect={() => setSelectedId(k.id)}
            />
          ))}
        </List>
      )}
      <Attribution>{HE.KV_ATTRIBUTION}{date ? HE.KV_ATTRIBUTION_DATE(date) : ''}</Attribution>
    </>
  );

  return (
    <NearbyResultsLayout
      refreshing={refreshing}
      toolbar={toolbar}
      list={list}
      map={empty ? null : (
        <NearbyMap center={[origin.lat, origin.lng]} radius={data.radiusM} points={points}
          selectedId={selectedId} onSelect={selectFromMap} ariaLabel={HE.KV_ARIA_MAP} youLabel={HE.MN_MAP_YOU} />
      )}
      selectedCard={selected && <KeverCard k={selected} selected onSelect={() => {}} />}
    />
  );
}
