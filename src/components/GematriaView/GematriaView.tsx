'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Gematria } from '@/types';
import { getJson, freshUrl, isAbort } from '@/lib/apiClient';
import { useRole } from '@/components/common/RoleContext';
import GematriaCard from './GematriaCard';
import GematriaForm from './GematriaForm';
import GematriaConnectionGroup from './GematriaConnectionGroup';
import SearchField from '@/components/common/SearchField';
import ListState, { InlineError } from '@/components/common/ListState';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const StickyBar = styled.div`
  position: sticky; top: var(--header-h, 56px); z-index: ${theme.z.sticky};
  margin: 0 calc(-1 * ${theme.layout.gutter});
  padding: ${theme.spacing.sm} ${theme.layout.gutter};
  background: ${theme.colors.background};
  background: color-mix(in srgb, ${theme.colors.background} 92%, transparent);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;






const CountBadge = styled.span`
  font-size: 0.82rem;
  color: ${theme.colors.textLight};
`;


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  align-items: start;
  @media (max-width: 480px) { gap: ${theme.spacing.xs}; }
  @media (max-width: 320px) { grid-template-columns: repeat(2, 1fr); }
`;

export default function GematriaView({ initialSearch = '' }: { initialSearch?: string }) {
  const [items, setItems] = useState<Gematria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [editItem, setEditItem] = useState<Gematria | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const role = useRole();

  // Only the first load blanks the list for a spinner; refreshes after a
  // save or delete keep the current rows on screen.
  const hasLoaded = useRef(false);

  const load = useCallback((signal?: AbortSignal, fresh = false) => {
    if (!hasLoaded.current) setLoading(true);
    setLoadError(false);
    getJson<Gematria[]>(fresh ? freshUrl('/api/gematria') : '/api/gematria', signal)
      .then(data => { setItems(data); hasLoaded.current = true; setLoading(false); })
      .catch((e: unknown) => {
        if (isAbort(e)) return;
        setLoadError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return items;
    return items.filter(g => g.word.includes(q) || String(g.value).includes(q));
  }, [items, search]);

  // Group by gematria value, sorted by value ascending
  const groups = useMemo(() => {
    const map = new Map<number, Gematria[]>();
    for (const g of filtered) {
      const list = map.get(g.value) ?? [];
      list.push(g);
      map.set(g.value, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([value, group]) => ({ value, group }));
  }, [filtered]);

  const handleDelete = async (item: Gematria) => {
    if (!window.confirm(HE.GEMATRIA_DELETE_CONFIRM)) return;
    setDeleteError(false);
    const res = await fetch(`/api/gematria/${item.id}`, { method: 'DELETE' });
    if (res.ok) load(undefined, true);
    else setDeleteError(true);
  };

  return (
    <Container>
      {(addOpen || editItem) && (
        <GematriaForm
          gematria={editItem ?? undefined}
          allItems={items}
          onClose={() => { setAddOpen(false); setEditItem(null); }}
          onSaved={() => load(undefined, true)}
        />
      )}

      <PageHeader
          icon="aleph"
          title={HE.GEMATRIA_TITLE}
          subtitle={<>{HE.GEMATRIA_SUBTITLE}
              {items.length > 0 && <CountBadge> {HE.GEMATRIA_COUNT(items.length)}</CountBadge>}</>}
          actions={<>{role === 'admin' && (
            <Button $size="sm" onClick={() => setAddOpen(true)}><LineIcon name="plus" size={17} strokeWidth={2.2} />{HE.GEMATRIA_ADD_BTN}</Button>
          )}</>}
        />

      <StickyBar>

        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={HE.GEMATRIA_SEARCH_PLACEHOLDER}
        />
      </StickyBar>

      <Grid>
        {deleteError && <InlineError role="alert">{HE.DELETE_ERROR}</InlineError>}
        {loading || loadError || filtered.length === 0 ? (
          <ListState
            loading={loading}
            error={loadError}
            emptyText={items.length > 0 && search.trim() ? HE.SEARCH_NO_RESULTS : HE.GEMATRIA_EMPTY_STATE}
            onRetry={() => load()}
          />
        ) : groups.map(({ value, group }) =>
          group.length >= 2 ? (
            <GematriaConnectionGroup
              key={value}
              value={value}
              items={group}
              onEdit={role === 'admin' ? (g) => setEditItem(g) : undefined}
              onDelete={role === 'admin' ? handleDelete : undefined}
            />
          ) : (
            <GematriaCard
              key={group[0].id}
              gematria={group[0]}
              onEdit={role === 'admin' ? () => setEditItem(group[0]) : undefined}
              onDelete={role === 'admin' ? () => handleDelete(group[0]) : undefined}
            />
          )
        )}
      </Grid>
    </Container>
  );
}
