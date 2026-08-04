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

const Container = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const StickyBar = styled.div`
  position: sticky;
  top: 60px;
  z-index: 50;
  background: ${theme.colors.background};
  margin-top: -${theme.spacing.xl};
  padding-top: ${theme.spacing.xl};
  padding-bottom: 2px;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  @media (max-width: 600px) { margin-top: -${theme.spacing.md}; padding-top: ${theme.spacing.md}; }
  @media (max-width: 480px) { top: 52px; }
`;

const TitleRow = styled.div`
  display: flex; align-items: flex-start;
  justify-content: space-between; flex-wrap: wrap; gap: ${theme.spacing.md};
`;
const TitleGroup = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;
const Title = styled.h1`font-size: 1.8rem; color: ${theme.colors.primary};`;
const Subtitle = styled.p`font-size: 0.95rem; color: ${theme.colors.textMuted};`;
const CountBadge = styled.span`font-size: 0.82rem; color: ${theme.colors.textLight};`;

const AddBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  flex-shrink: 0; align-self: flex-start;
  &:hover { background: ${theme.colors.primaryLight}; }
`;


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

      <StickyBar>
        <TitleRow>
          <TitleGroup>
            <Title>{HE.CHIDUSHIM_TITLE}</Title>
            <Subtitle>
              {HE.CHIDUSHIM_SUBTITLE}
              {filtered.length > 0 && <CountBadge> {HE.CHIDUSHIM_COUNT(filtered.length)}</CountBadge>}
            </Subtitle>
          </TitleGroup>
          {role === 'admin' && (
            <AddBtn onClick={() => setAddOpen(true)}>{HE.CHIDUSHIM_ADD_BTN}</AddBtn>
          )}
        </TitleRow>

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
