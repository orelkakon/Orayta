'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Chidush } from '@/types';
import { getJson, freshUrl, isAbort } from '@/lib/apiClient';
import { useRole } from '@/components/common/RoleContext';
import ChidushCard from './ChidushCard';
import ChidushForm from './ChidushForm';
import SearchField from '@/components/common/SearchField';
import ListState, { InlineError } from '@/components/common/ListState';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';

const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const StickyBar = styled.div`
  position: sticky; top: var(--header-h, 56px); z-index: ${theme.z.sticky};
  margin: 0 calc(-1 * ${theme.layout.gutter});
  padding: ${theme.spacing.sm} ${theme.layout.gutter};
  background: ${theme.colors.background};
  background: color-mix(in srgb, ${theme.colors.background} 92%, transparent);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const CountBadge = styled.span`font-size: 0.82rem; color: ${theme.colors.textLight};`;



const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

export default function ChidushimView({ initialSearch = '' }: { initialSearch?: string }) {
  const [items,    setItems]    = useState<Chidush[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [search,   setSearch]   = useState(initialSearch);
  const [editItem, setEditItem] = useState<Chidush | null>(null);
  const [addOpen,  setAddOpen]  = useState(false);
  const role = useRole();

  // Only the first load blanks the list for a spinner; refreshes after a
  // save or delete keep the current rows on screen.
  const hasLoaded = useRef(false);

  const load = useCallback((signal?: AbortSignal, fresh = false) => {
    if (!hasLoaded.current) setLoading(true);
    setLoadError(false);
    getJson<Chidush[]>(fresh ? freshUrl('/api/chidushim') : '/api/chidushim', signal)
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
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c =>
      c.text.toLowerCase().includes(q) ||
      (c.source ?? '').toLowerCase().includes(q) ||
      (c.author ?? '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleDelete = async (c: Chidush) => {
    if (!window.confirm(HE.CHIDUSH_DELETE_CONFIRM)) return;
    setDeleteError(false);
    const res = await fetch(`/api/chidushim/${c.id}`, { method: 'DELETE' });
    if (res.ok) load(undefined, true);
    else setDeleteError(true);
  };

  return (
    <Container>
      {(addOpen || editItem) && (
        <ChidushForm
          chidush={editItem ?? undefined}
          onClose={() => { setAddOpen(false); setEditItem(null); }}
          onSaved={() => load(undefined, true)}
        />
      )}

      <PageHeader
          icon="bulb"
          title={HE.CHIDUSHIM_TITLE}
          subtitle={<>{HE.CHIDUSHIM_SUBTITLE}
              {filtered.length > 0 && <CountBadge> {HE.CHIDUSHIM_COUNT(filtered.length)}</CountBadge>}</>}
          actions={<>{role === 'admin' && (
            <Button $size="sm" onClick={() => setAddOpen(true)}><LineIcon name="plus" size={17} strokeWidth={2.2} />{HE.CHIDUSHIM_ADD_BTN}</Button>
          )}</>}
        />

      <StickyBar>

        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={HE.CHIDUSHIM_SEARCH_PLACEHOLDER}
        />
      </StickyBar>

      <List>
        {deleteError && <InlineError role="alert">{HE.DELETE_ERROR}</InlineError>}
        {loading || loadError || filtered.length === 0
          ? (
            <ListState
              loading={loading}
              error={loadError}
              emptyText={items.length > 0 && search.trim() ? HE.SEARCH_NO_RESULTS : HE.CHIDUSHIM_EMPTY_STATE}
              onRetry={() => load()}
            />
          )
          : filtered.map((c, i) => (
              <ChidushCard
                key={c.id}
                chidush={c}
                index={i}
                onEdit={role === 'admin' ? () => setEditItem(c) : undefined}
                onDelete={role === 'admin' ? () => handleDelete(c) : undefined}
              />
            ))
        }
      </List>
    </Container>
  );
}
