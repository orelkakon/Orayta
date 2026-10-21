'use client';

import { useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import StickyTabs, { TabBtn } from '@/components/common/StickyTabs';
import StudyView from '@/components/StudyView/StudyView';
import AddCitation from '@/components/AddCitation/AddCitation';

type Tab = 'view' | 'add';

export default function TalmudView({ initialMasechet = '' }: { initialMasechet?: string }) {
  const [tab, setTab] = useState<Tab>('view');
  const role = useRole();

  return (
    <StickyTabs
      tabs={<>
        <TabBtn $active={tab === 'view'} onClick={() => setTab('view')}>
          {HE.TALMUD_TAB_VIEW}
        </TabBtn>
        {role === 'admin' && (
          <TabBtn $active={tab === 'add'} onClick={() => setTab('add')}>
            {HE.TALMUD_TAB_ADD}
          </TabBtn>
        )}
      </>}
    >
      {tab === 'view' ? <StudyView initialMasechet={initialMasechet} /> : <AddCitation />}
    </StickyTabs>
  );
}
