'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Chidush } from '@/types';
import { useRole } from '@/components/common/RoleContext';
import ChidushCard from './ChidushCard';
import ChidushForm from './ChidushForm';
import SearchField from '@/components/common/SearchField';

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
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 0.9rem; font-weight: 600;
  flex-shrink: 0; align-self: flex-start;
  &:hover { background: ${theme.colors.primaryLight}; }
`;


const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Empty = styled.div`
  text-align: center; color: ${theme.colors.textMuted}; padding: ${theme.spacing.xxl};
`;

export default function ChidushimView({ initialSearch = '' }: { initialSearch?: string }) {
  const [items,    setItems]    = useState<Chidush[]>([]);
  const [search,   setSearch]   = useState(initialSearch);
  const [editItem, setEditItem] = useState<Chidush | null>(null);
  const [addOpen,  setAddOpen]  = useState(false);
  const role = useRole();

  const load = useCallback(() => {
    void fetch('/api/chidushim').then(r => r.json()).then(setItems as (v: unknown) => void);
  }, []);

  useEffect(() => { load(); }, [load]);

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
    const res = await fetch(`/api/chidushim/${c.id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <Container>
      {(addOpen || editItem) && (
        <ChidushForm
          chidush={editItem ?? undefined}
          onClose={() => { setAddOpen(false); setEditItem(null); }}
          onSaved={load}
        />
      )}

      <StickyBar>
        <TitleRow>
          <TitleGroup>
            <Title>{HE.CHIDUSHIM_TITLE}</Title>
            <Subtitle>
              {HE.CHIDUSHIM_SUBTITLE}
              {items.length > 0 && <CountBadge> {HE.CHIDUSHIM_COUNT(items.length)}</CountBadge>}
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
        {filtered.length === 0
          ? <Empty>{items.length === 0 ? HE.CHIDUSHIM_EMPTY : 'לא נמצאו תוצאות'}</Empty>
          : filtered.map(c => (
              <ChidushCard
                key={c.id}
                chidush={c}
                onEdit={role === 'admin' ? () => setEditItem(c) : undefined}
                onDelete={role === 'admin' ? () => handleDelete(c) : undefined}
              />
            ))
        }
      </List>
    </Container>
  );
}
