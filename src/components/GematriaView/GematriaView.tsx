'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Gematria } from '@/types';
import { useRole } from '@/components/common/RoleContext';
import GematriaCard from './GematriaCard';
import GematriaForm from './GematriaForm';
import GematriaConnectionGroup from './GematriaConnectionGroup';
import SearchField from '@/components/common/SearchField';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
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


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  align-items: start;
  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 420px) { grid-template-columns: 1fr; }
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl};
`;

export default function GematriaView() {
  const [items, setItems] = useState<Gematria[]>([]);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<Gematria | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const role = useRole();

  const load = useCallback(() => {
    void fetch('/api/gematria').then(r => r.json()).then(setItems as (v: unknown) => void);
  }, []);

  useEffect(() => { load(); }, [load]);

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
    const res = await fetch(`/api/gematria/${item.id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <Container>
      {(addOpen || editItem) && (
        <GematriaForm
          gematria={editItem ?? undefined}
          allItems={items}
          onClose={() => { setAddOpen(false); setEditItem(null); }}
          onSaved={load}
        />
      )}

      <TitleRow>
        <TitleGroup>
          <Title>{HE.GEMATRIA_TITLE}</Title>
          <Subtitle>
            {HE.GEMATRIA_SUBTITLE}
            {items.length > 0 && <CountBadge> {HE.GEMATRIA_COUNT(items.length)}</CountBadge>}
          </Subtitle>
        </TitleGroup>
        {role === 'admin' && (
          <AddBtn onClick={() => setAddOpen(true)}>{HE.GEMATRIA_ADD_BTN}</AddBtn>
        )}
      </TitleRow>

      <SearchField
        value={search}
        onChange={setSearch}
        placeholder={HE.GEMATRIA_SEARCH_PLACEHOLDER}
      />

      <Grid>
        {filtered.length === 0 ? (
          <Empty>{HE.GEMATRIA_EMPTY}</Empty>
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
