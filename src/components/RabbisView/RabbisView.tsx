'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory, Book } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS } from '@/lib/rabbisData';
import { useRole } from '@/components/common/RoleContext';
import RabbiCard from './RabbiCard';
import RabbiForm from './RabbiForm';
import RabbisTimeline from './RabbisTimeline';
import SearchField from '@/components/common/SearchField';

const RabbisMap = dynamic(() => import('./RabbisMapInner'), {
  ssr: false,
  loading: () => <MapLoading>טוען מפה...</MapLoading>,
});

const MapLoading = styled.div`
  height: 420px; display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.textMuted}; font-size: 0.9rem;
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.lg};
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

const TitleGroup = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;

const AddBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  flex-shrink: 0; align-self: flex-start;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${theme.colors.primary};
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: ${theme.colors.textMuted};
`;

const CountBadge = styled.span`
  font-size: 0.82rem;
  color: ${theme.colors.textLight};
`;


const TabsScroll = styled.div`
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
    $active ? ($color ?? theme.colors.primary) + '18' : 'transparent'};
  color: ${({ $active, $color }) =>
    $active ? ($color ?? theme.colors.primary) : theme.colors.textMuted};
  transition: all 0.15s;
  &:hover {
    border-color: ${({ $color }) => $color ?? theme.colors.primary};
    color: ${({ $color }) => $color ?? theme.colors.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl};
`;

/* Segment toggle — pill style, visually distinct from action buttons */
const SegmentRow = styled.div`
  display: flex;
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  overflow: hidden;
`;
const SegBtn = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  font-size: 0.82rem; font-weight: 600;
  border-left: 1.5px solid ${theme.colors.border};
  background: ${({ $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : theme.colors.textMuted};
  transition: all 0.15s;
  &:first-child { border-left: none; }
  &:hover { background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.surfaceAlt}; }
`;

interface Props { initialSearch?: string; }

export default function RabbisView({ initialSearch = '' }: Props) {
  const [rabbis, setRabbis] = useState<Rabbi[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState(initialSearch);
  const [editRabbi, setEditRabbi] = useState<Rabbi | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<'list' | 'timeline' | 'map'>('list');
  const role = useRole();

  const load = useCallback(() => {
    void fetch('/api/rabbis').then(r => r.json()).then(setRabbis as (v: unknown) => void);
    void fetch('/api/books').then(r => r.json()).then(setBooks as (v: unknown) => void);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = rabbis;
    if (category !== 'all') list = list.filter(r => r.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.fullName ?? '').toLowerCase().includes(q) ||
        r.bio.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rabbis, category, search]);

  const countFor = (cat: string) =>
    rabbis.filter(r => cat === 'all' || r.category === cat).length;

  const handleDelete = async (rabbi: Rabbi) => {
    if (!window.confirm(HE.RABBI_DELETE_CONFIRM)) return;
    const res = await fetch(`/api/rabbis/${rabbi.id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <Container>
      {(addOpen || editRabbi) && (
        <RabbiForm
          rabbi={editRabbi ?? undefined}
          onClose={() => { setAddOpen(false); setEditRabbi(null); }}
          onSaved={load}
        />
      )}

      <TitleRow>
        <TitleGroup>
          <Title>{HE.RABBIS_TITLE}</Title>
          <Subtitle>
            {HE.RABBIS_SUBTITLE}
            {rabbis.length > 0 && <CountBadge> {HE.RABBIS_COUNT(rabbis.length)}</CountBadge>}
          </Subtitle>
        </TitleGroup>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs, alignItems: 'flex-end' }}>
          <SegmentRow>
            <SegBtn $active={view === 'list'}     onClick={() => setView('list')}>📋 {HE.RABBIS_LIST_VIEW}</SegBtn>
            <SegBtn $active={view === 'timeline'} onClick={() => setView('timeline')}>📅 {HE.RABBIS_TIMELINE_VIEW}</SegBtn>
            <SegBtn $active={view === 'map'}      onClick={() => setView('map')}>🗺️ {HE.RABBIS_MAP_VIEW}</SegBtn>
          </SegmentRow>
          {role === 'admin' && (
            <AddBtn onClick={() => setAddOpen(true)}>{HE.RABBI_ADD_BTN}</AddBtn>
          )}
        </div>
      </TitleRow>

      <SearchField
        value={search}
        onChange={setSearch}
        placeholder={HE.RABBIS_SEARCH_PLACEHOLDER}
      />

      <TabsScroll>
        <Tab $active={category === 'all'} onClick={() => setCategory('all')}>
          {HE.RABBIS_FILTER_ALL} ({countFor('all')})
        </Tab>
        {CATEGORY_ORDER.map(cat => (
          <Tab
            key={cat}
            $active={category === cat}
            $color={CATEGORY_COLORS[cat]}
            onClick={() => setCategory(cat)}
          >
            {CATEGORY_LABELS[cat]} ({countFor(cat)})
          </Tab>
        ))}
      </TabsScroll>

      {view === 'timeline' && <RabbisTimeline rabbis={filtered} />}
      {view === 'map'      && <RabbisMap rabbis={filtered} />}
      {view === 'list'     && (
        <Grid>
          {filtered.length === 0
            ? <Empty>{HE.STUDY_EMPTY}</Empty>
            : filtered.map(r => (
                <RabbiCard
                  key={r.id}
                  rabbi={r}
                  books={books.filter(b => b.rabbiId === r.id).map(b => ({ id: b.id, title: b.title }))}
                  onEdit={role === 'admin' ? () => setEditRabbi(r) : undefined}
                  onDelete={role === 'admin' ? () => handleDelete(r) : undefined}
                />
              ))
          }
        </Grid>
      )}
    </Container>
  );
}
