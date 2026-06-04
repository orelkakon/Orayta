'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS } from '@/lib/rabbisData';
import RabbiCard from './RabbiCard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
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

const SearchInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  outline: none;
  width: 100%;
  &:focus { border-color: ${theme.colors.primaryLight}; }
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

export default function RabbisView() {
  const [rabbis, setRabbis] = useState<Rabbi[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetch('/api/rabbis').then(r => r.json()).then(setRabbis as (v: unknown) => void);
  }, []);

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

  return (
    <Container>
      <TitleRow>
        <Title>{HE.RABBIS_TITLE}</Title>
        <Subtitle>
          {HE.RABBIS_SUBTITLE}
          {rabbis.length > 0 && <CountBadge> · {rabbis.length} רבנים</CountBadge>}
        </Subtitle>
      </TitleRow>

      <SearchInput
        value={search}
        onChange={e => setSearch(e.target.value)}
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

      <Grid>
        {filtered.length === 0
          ? <Empty>{HE.STUDY_EMPTY}</Empty>
          : filtered.map(r => <RabbiCard key={r.id} rabbi={r} />)
        }
      </Grid>
    </Container>
  );
}
