'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, Book } from '@/types';
import { getJson, freshUrl, isAbort } from '@/lib/apiClient';
import { useRole } from '@/components/common/RoleContext';
import RabbiCard from './RabbiCard';
import RabbiForm from './RabbiForm';
import CategoryTabs from './CategoryTabs';
import GenerationsTimeline from './timeline/GenerationsTimeline';
import SearchField from '@/components/common/SearchField';
import ListState, { InlineError } from '@/components/common/ListState';
import PageHeader from '@/components/ui/PageHeader';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';

const RabbisMap = dynamic(() => import('./RabbisMapInner'), {
  ssr: false,
  loading: () => <MapLoading>{HE.LOADING}</MapLoading>,
});

const MapLoading = styled.div`
  height: 420px; display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.textMuted}; font-size: 0.9rem;
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.lg};
`;

const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const StickyBar = styled.div`
  position: sticky; top: var(--header-h, 56px); z-index: ${theme.z.sticky};
  margin: 0 calc(-1 * ${theme.layout.gutter});
  padding: ${theme.spacing.sm} ${theme.layout.gutter};
  background: ${theme.colors.background};
  box-shadow: 0 1px 0 ${theme.colors.borderLight};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const CountBadge = styled.span`font-size: 0.82rem; color: ${theme.colors.textLight};`;

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr); gap: ${theme.spacing.lg};
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

export type RabbisViewMode = 'list' | 'timeline' | 'map';

const VIEWS: { value: RabbisViewMode; label: string }[] = [
  { value: 'list', label: HE.RABBIS_LIST_VIEW },
  { value: 'timeline', label: HE.RABBIS_TIMELINE_VIEW },
  { value: 'map', label: HE.RABBIS_MAP_VIEW },
];

const ViewSwitch = styled.div`
  margin: -${theme.spacing.sm} 0 -${theme.spacing.sm};
  ${theme.up.md} { max-width: 420px; }
`;

interface Props { initialSearch?: string; initialView?: RabbisViewMode; }

export default function RabbisView({ initialSearch = '', initialView = 'list' }: Props) {
  const [rabbis, setRabbis] = useState<Rabbi[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState(initialSearch);
  const [editRabbi, setEditRabbi] = useState<Rabbi | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<RabbisViewMode>(initialView);
  const role = useRole();

  // Only the first load blanks the list for a spinner; refreshes after a
  // save or delete keep the current rows on screen.
  const hasLoaded = useRef(false);

  const load = useCallback((signal?: AbortSignal, fresh = false) => {
    if (!hasLoaded.current) setLoading(true);
    setLoadError(false);
    getJson<Rabbi[]>(fresh ? freshUrl('/api/rabbis') : '/api/rabbis', signal)
      .then(data => { setRabbis(data); hasLoaded.current = true; setLoading(false); })
      .catch((e: unknown) => {
        if (isAbort(e)) return;
        setLoadError(true);
        setLoading(false);
      });
    // Books only decorate the cards — a failure here must not blank the page.
    getJson<Book[]>('/api/books', signal)
      .then(setBooks)
      .catch(() => { /* ignore */ });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

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

  // From the timeline to a person's full card: the list, narrowed to them.
  const openCard = useCallback((rabbi: Rabbi) => {
    setCategory('all');
    setSearch(rabbi.name);
    setView('list');
    window.scrollTo({ top: 0 });
  }, []);

  const handleDelete = async (rabbi: Rabbi) => {
    if (!window.confirm(HE.RABBI_DELETE_CONFIRM)) return;
    setDeleteError(false);
    const res = await fetch(`/api/rabbis/${rabbi.id}`, { method: 'DELETE' });
    if (res.ok) load(undefined, true);
    else setDeleteError(true);
  };

  return (
    <Container>
      {(addOpen || editRabbi) && (
        <RabbiForm
          rabbi={editRabbi ?? undefined}
          onClose={() => { setAddOpen(false); setEditRabbi(null); }}
          onSaved={() => load(undefined, true)}
        />
      )}

      <PageHeader
        icon="users"
        title={HE.RABBIS_TITLE}
        subtitle={<>{HE.RABBIS_SUBTITLE}
          {filtered.length > 0 && <CountBadge> {HE.RABBIS_COUNT(filtered.length)}</CountBadge>}</>}
        actions={role === 'admin' ? <Button $size="sm" onClick={() => setAddOpen(true)}><LineIcon name="plus" size={17} strokeWidth={2.2} />{HE.RABBI_ADD_BTN}</Button> : undefined}
      />

      <ViewSwitch>
        <SegmentedControl ariaLabel={HE.RABBIS_VIEW_ARIA} value={view} onChange={setView} options={VIEWS} />
      </ViewSwitch>

      <StickyBar>
        <SearchField value={search} onChange={setSearch} placeholder={HE.RABBIS_SEARCH_PLACEHOLDER} />
        <CategoryTabs rabbis={rabbis} value={category} onChange={setCategory} />
      </StickyBar>

      {deleteError && <InlineError role="alert">{HE.DELETE_ERROR}</InlineError>}

      {loading || loadError ? (
        <ListState loading={loading} error={loadError} emptyText={HE.RABBIS_EMPTY} onRetry={() => load()} />
      ) : (
        <>
          {view === 'timeline' && <GenerationsTimeline rabbis={filtered} onOpen={openCard} />}
          {view === 'map' && <RabbisMap rabbis={filtered} />}
          {view !== 'map' && filtered.length === 0 && (
            <ListState
              loading={false}
              error={false}
              emptyText={rabbis.length > 0 && search.trim() ? HE.SEARCH_NO_RESULTS : HE.RABBIS_EMPTY}
              onRetry={() => load()}
            />
          )}
          {view === 'list' && filtered.length > 0 && (
            <Grid>
              {filtered.map((r, i) => (
                <RabbiCard
                  key={r.id}
                  rabbi={r}
                  index={i}
                  books={books.filter(b => b.rabbiId === r.id).map(b => ({ id: b.id, title: b.title }))}
                  onEdit={role === 'admin' ? () => setEditRabbi(r) : undefined}
                  onDelete={role === 'admin' ? () => handleDelete(r) : undefined}
                />
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}
