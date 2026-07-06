'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import RabbisView from '@/components/RabbisView/RabbisView';
import BooksView from '@/components/BooksView/BooksView';

type Tab = 'rabbis' | 'books';

const Wrapper = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const SubNav = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.borderLight};
  position: sticky;
  top: 60px;
  z-index: 51;
  background: ${theme.colors.background};
  @media (max-width: 480px) { top: 52px; }
`;

const TabBtn = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: 0.95rem; font-weight: 600;
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  border-bottom: 2px solid ${({ $active }) => ($active ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
  border-radius: ${theme.radii.sm} ${theme.radii.sm} 0 0;
  &:hover { color: ${theme.colors.primary}; }
`;

interface Props { initialTab?: Tab; initialSearch?: string; }

export default function RabbisAndBooksView({ initialTab = 'rabbis', initialSearch = '' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [rabbisKey, setRabbisKey] = useState(0);
  const [rabbisSearch, setRabbisSearch] = useState(initialSearch);

  const handleViewRabbi = (name: string) => {
    setRabbisSearch(name);
    setRabbisKey(k => k + 1);
    setTab('rabbis');
  };

  return (
    <Wrapper>
      <SubNav>
        <TabBtn $active={tab === 'rabbis'} onClick={() => setTab('rabbis')}>
          👥 {HE.RABBIS_BOOKS_TAB_RABBIS}
        </TabBtn>
        <TabBtn $active={tab === 'books'} onClick={() => setTab('books')}>
          📖 {HE.RABBIS_BOOKS_TAB_BOOKS}
        </TabBtn>
      </SubNav>

      {tab === 'rabbis'
        ? <RabbisView key={rabbisKey} initialSearch={rabbisSearch} />
        : <BooksView onViewRabbi={handleViewRabbi} />
      }
    </Wrapper>
  );
}
