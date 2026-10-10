'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { MinyanTime, NearbyResponse, Synagogue } from '@/types/minyan';
import type { Origin } from './useMinyanSearch';
import SynagogueCard from './SynagogueCard';
import ReliabilityLegend from './ReliabilityLegend';
import { Chip, Muted, Panel } from './minyanStyles';

const MinyanMap = dynamic(() => import('./MinyanMapInner'), {
  ssr: false,
  loading: () => <MapLoading>{HE.LOADING}</MapLoading>,
});

const MapLoading = styled.div`
  height: clamp(240px, 42svh, 400px); display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.textMuted}; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.lg};
`;

const Toolbar = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Chips = styled.div`display: flex; gap: 6px;`;
const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.ms};`;
const Empty = styled(Panel)`text-align: center; display: flex; flex-direction: column; gap: 6px; padding: ${theme.spacing.xl};`;
const EmptyTitle = styled.strong`font-size: ${theme.fontSizes.lg}; color: ${theme.colors.primary};`;

export type Picker =
  | { kind: 'report'; s: Synagogue; time: MinyanTime | null }
  | { kind: 'gabbai'; s: Synagogue };

interface Props {
  data: NearbyResponse;
  origin: Origin;
  radius: number;
  isAdmin: boolean;
  onOpen: (p: Picker) => void;
}

/** Map + filter + distance-sorted list, with honest empty states. */
export default function MinyanResults({ data, origin, radius, isAdmin, onOpen }: Props) {
  const [knownOnly, setKnownOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const cardRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const known = data.synagogues.filter(s => s.status !== 'unknown');
  const shown = knownOnly ? known : data.synagogues;

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    if (knownOnly && !known.some(s => s.id === id)) setKnownOnly(false);
    requestAnimationFrame(() => cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  if (data.synagogues.length === 0) {
    return (
      <Empty role="status">
        <EmptyTitle>{HE.MN_EMPTY_TITLE}</EmptyTitle>
        <Muted>{HE.MN_EMPTY_SUB}</Muted>
      </Empty>
    );
  }

  return (
    <>
      <MinyanMap origin={origin} radius={radius} synagogues={shown} selectedId={selectedId} onSelect={selectFromMap} />
      <Toolbar>
        <Muted role="status">{HE.MN_RESULTS_COUNT(data.synagogues.length, known.length)}</Muted>
        <Chips role="group">
          <Chip $active={!knownOnly} aria-pressed={!knownOnly} onClick={() => setKnownOnly(false)}>{HE.MN_FILTER_ALL}</Chip>
          <Chip $active={knownOnly} aria-pressed={knownOnly} onClick={() => setKnownOnly(true)}>{HE.MN_FILTER_KNOWN}</Chip>
        </Chips>
      </Toolbar>
      {data.truncated && <Muted>{HE.MN_TRUNCATED}</Muted>}
      <ReliabilityLegend />
      {shown.length === 0 ? (
        <Empty role="status"><Muted>{HE.MN_EMPTY_FILTERED}</Muted></Empty>
      ) : (
        <List>
          {shown.map(s => (
            <SynagogueCard
              key={s.id}
              ref={el => { if (el) cardRefs.current.set(s.id, el); else cardRefs.current.delete(s.id); }}
              s={s}
              now={now}
              selected={s.id === selectedId}
              isAdmin={isAdmin}
              onSelect={() => setSelectedId(s.id)}
              onReport={() => onOpen({ kind: 'report', s, time: null })}
              onPickTime={t => onOpen({ kind: 'report', s, time: t })}
              onEditGabbai={() => onOpen({ kind: 'gabbai', s })}
            />
          ))}
        </List>
      )}
    </>
  );
}
