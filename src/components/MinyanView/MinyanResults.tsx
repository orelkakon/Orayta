'use client';

import { useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { NearbyResponse } from '@/types/minyan';
import { nedarimAreaUrl } from '@/lib/minyan/geo';
import { formatSourceDate } from '@/lib/minyan/format';
import NearbyMap, { MapPoint } from '@/components/NearbyMap/NearbyMap';
import NearbyResultsLayout from '@/components/Nearby/NearbyResultsLayout';
import { LineIcon } from '@/components/common/LineIcons';
import type { Origin } from './useMinyanSearch';
import SynagogueCard from './SynagogueCard';
import ReliabilityLegend from './ReliabilityLegend';
import { Chip, Muted, Panel } from './minyanStyles';

const Toolbar = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Chips = styled.div`display: flex; gap: 6px;`;
const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.ms};`;
const Empty = styled(Panel)`text-align: center; display: flex; flex-direction: column; gap: 6px; padding: ${theme.spacing.xl};`;
const EmptyTitle = styled.strong`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${theme.colors.text};`;
const Warn = styled.p`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.text}; background: ${theme.colors.bgWarning}; padding: 8px ${theme.spacing.ms}; border-radius: 12px;`;

const External = styled.a`
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.ms} ${theme.spacing.md}; border-radius: 16px;
  border: 1px dashed color-mix(in srgb, ${theme.colors.gold} 70%, transparent); background: ${theme.colors.surface};
  font-weight: 700; color: ${theme.colors.text}; font-size: ${theme.fontSizes.sm};
  span { display: flex; flex-direction: column; gap: 2px; flex: 1; }
`;

const Attribution = styled.p`font-size: ${theme.fontSizes.xxs}; color: ${theme.colors.textLight}; line-height: 1.6;`;

interface Props { data: NearbyResponse; origin: Origin; radius: number; refreshing: boolean }

/** Distance-sorted synagogues with a map, honest empty / partial states. */
export default function MinyanResults({ data, origin, radius, refreshing }: Props) {
  const [knownOnly, setKnownOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const withTimes = data.synagogues.filter(s => s.schedule);
  const shown = knownOnly ? withTimes : data.synagogues;
  const down = data.providers.filter(p => p.state === 'error');
  const bsDate = formatSourceDate(data.providers.find(p => p.provider === 'muni-beersheva')?.datasetUpdatedAt ?? null);
  const osmSnapshot = data.providers.find(p => p.provider === 'osm' && p.snapshot);
  const snapDate = formatSourceDate(osmSnapshot?.datasetUpdatedAt ?? null);

  const points: MapPoint[] = shown.map(s => ({
    id: s.id, lat: s.lat, lng: s.lng, label: s.name ?? HE.MN_UNNAMED,
    tone: s.schedule ? 'sched' : 'nosched', approx: s.existence.level === 'low',
  }));

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    if (knownOnly && !withTimes.some(s => s.id === id)) setKnownOnly(false);
    requestAnimationFrame(() => cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const selected = shown.find(s => s.id === selectedId) ?? null;
  const empty = data.synagogues.length === 0;

  const toolbar = !empty && (
    <>
      {down.map(p => <Warn key={p.provider} role="status">{HE.MN_PROVIDER_DOWN(HE.MN_PROVIDERS[p.provider])}</Warn>)}
      <Toolbar>
        <Muted role="status">{HE.MN_RESULTS_COUNT(data.synagogues.length, withTimes.length)}</Muted>
        <Chips role="group">
          <Chip $active={!knownOnly} aria-pressed={!knownOnly} onClick={() => setKnownOnly(false)}>{HE.MN_FILTER_ALL}</Chip>
          <Chip $active={knownOnly} aria-pressed={knownOnly} onClick={() => setKnownOnly(true)}>{HE.MN_FILTER_KNOWN}</Chip>
        </Chips>
      </Toolbar>
      {data.truncated && <Muted>{HE.MN_TRUNCATED}</Muted>}
    </>
  );

  const list = (
    <>
      {empty ? (
        <Empty role="status"><EmptyTitle>{HE.MN_EMPTY_TITLE}</EmptyTitle><Muted>{HE.MN_EMPTY_SUB}</Muted></Empty>
      ) : shown.length === 0 ? (
        <Empty role="status"><Muted>{HE.MN_EMPTY_FILTERED}</Muted></Empty>
      ) : (
        <List>
          {shown.map(s => (
            <SynagogueCard
              key={s.id}
              ref={el => { if (el) cardRefs.current.set(s.id, el); else cardRefs.current.delete(s.id); }}
              s={s}
              selected={s.id === selectedId}
              onSelect={() => setSelectedId(s.id)}
            />
          ))}
        </List>
      )}
      <External href={nedarimAreaUrl(origin.lat, origin.lng, radius)} target="_blank" rel="noopener noreferrer">
        <span>{HE.MN_NEDARIM_LINK}<Muted>{HE.MN_NEDARIM_NOTE}</Muted></span>
        <LineIcon name="chevron" size={18} />
      </External>
      <ReliabilityLegend />
      <Attribution>
        {HE.MN_ATTRIBUTION}{bsDate ? HE.MN_ATTRIBUTION_DATE(bsDate) : ''}
        {snapDate && <><br />{HE.MN_OSM_SNAPSHOT(snapDate)}</>}
      </Attribution>
    </>
  );

  return (
    <NearbyResultsLayout
      refreshing={refreshing}
      toolbar={toolbar}
      list={list}
      map={empty ? null : (
        <NearbyMap center={[origin.lat, origin.lng]} radius={radius} points={points}
          selectedId={selectedId} onSelect={selectFromMap} ariaLabel={HE.MN_ARIA_MAP} youLabel={HE.MN_MAP_YOU} />
      )}
      selectedCard={selected && <SynagogueCard s={selected} selected onSelect={() => {}} />}
    />
  );
}
