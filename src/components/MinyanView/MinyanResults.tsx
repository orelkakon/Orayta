'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { NearbyResponse } from '@/types/minyan';
import { nedarimAreaUrl } from '@/lib/minyan/geo';
import { formatSourceDate } from '@/lib/minyan/format';
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
const Warn = styled.p`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.text}; background: ${theme.colors.bgWarning}; padding: 6px ${theme.spacing.sm}; border-radius: ${theme.radii.sm};`;

const External = styled.a`
  display: flex; flex-direction: column; gap: 2px;
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border-radius: ${theme.radii.md};
  border: 1.5px dashed ${theme.colors.secondary}; background: ${theme.colors.surface};
  font-weight: 700; color: ${theme.colors.primary}; font-size: ${theme.fontSizes.sm};
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

const Attribution = styled.p`font-size: 0.68rem; color: ${theme.colors.textLight}; line-height: 1.5;`;

interface Props { data: NearbyResponse; origin: Origin; radius: number; }

/** Map + filter + distance-sorted list, with honest empty / partial states. */
export default function MinyanResults({ data, origin, radius }: Props) {
  const [knownOnly, setKnownOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const withTimes = data.synagogues.filter(s => s.schedule);
  const shown = knownOnly ? withTimes : data.synagogues;
  const down = data.providers.filter(p => p.state === 'error');
  const bsDate = formatSourceDate(data.providers.find(p => p.provider === 'muni-beersheva')?.datasetUpdatedAt ?? null);

  const selectFromMap = (id: string) => {
    setSelectedId(id);
    if (knownOnly && !withTimes.some(s => s.id === id)) setKnownOnly(false);
    requestAnimationFrame(() => cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const footer = <Attribution>{HE.MN_ATTRIBUTION}{bsDate ? HE.MN_ATTRIBUTION_DATE(bsDate) : ''}</Attribution>;
  const nedarim = (
    <External href={nedarimAreaUrl(origin.lat, origin.lng, radius)} target="_blank" rel="noopener noreferrer">
      {HE.MN_NEDARIM_LINK}
      <Muted>{HE.MN_NEDARIM_NOTE}</Muted>
    </External>
  );

  return (
    <>
      {down.map(p => <Warn key={p.provider} role="status">{HE.MN_PROVIDER_DOWN(HE.MN_PROVIDERS[p.provider])}</Warn>)}
      {data.synagogues.length === 0 ? (
        <Empty role="status"><EmptyTitle>{HE.MN_EMPTY_TITLE}</EmptyTitle><Muted>{HE.MN_EMPTY_SUB}</Muted></Empty>
      ) : (
        <>
          <MinyanMap origin={origin} radius={radius} synagogues={shown} selectedId={selectedId} onSelect={selectFromMap} />
          <Toolbar>
            <Muted role="status">{HE.MN_RESULTS_COUNT(data.synagogues.length, withTimes.length)}</Muted>
            <Chips role="group">
              <Chip $active={!knownOnly} aria-pressed={!knownOnly} onClick={() => setKnownOnly(false)}>{HE.MN_FILTER_ALL}</Chip>
              <Chip $active={knownOnly} aria-pressed={knownOnly} onClick={() => setKnownOnly(true)}>{HE.MN_FILTER_KNOWN}</Chip>
            </Chips>
          </Toolbar>
          {data.truncated && <Muted>{HE.MN_TRUNCATED}</Muted>}
        </>
      )}
      {nedarim}
      <ReliabilityLegend />
      {data.synagogues.length > 0 && (shown.length === 0 ? (
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
      ))}
      {footer}
    </>
  );
}
