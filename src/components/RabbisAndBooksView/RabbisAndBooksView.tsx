'use client';

import { useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import StickyTabs, { TabBtn } from '@/components/common/StickyTabs';
import RabbisView from '@/components/RabbisView/RabbisView';
import BooksView from '@/components/BooksView/BooksView';

type Tab = 'rabbis' | 'books';

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
    <StickyTabs
      tabs={<>
        <TabBtn $active={tab === 'rabbis'} onClick={() => setTab('rabbis')}>
          👥 {HE.RABBIS_BOOKS_TAB_RABBIS}
        </TabBtn>
        <TabBtn $active={tab === 'books'} onClick={() => setTab('books')}>
          📖 {HE.RABBIS_BOOKS_TAB_BOOKS}
        </TabBtn>
      </>}
    >
      {tab === 'rabbis'
        ? <RabbisView key={rabbisKey} initialSearch={rabbisSearch} />
        : <BooksView onViewRabbi={handleViewRabbi} />
      }
    </StickyTabs>
  );
}
