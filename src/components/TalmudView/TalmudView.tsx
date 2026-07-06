'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import StudyView from '@/components/StudyView/StudyView';
import AddCitation from '@/components/AddCitation/AddCitation';

type Tab = 'view' | 'add';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const SubNav = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.borderLight};
  padding-bottom: 0;
  position: sticky;
  top: 60px;
  z-index: 51;
  background: ${theme.colors.background};
  @media (max-width: 480px) { top: 52px; }
`;

const TabBtn = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  border-bottom: 2px solid ${({ $active }) => ($active ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
  border-radius: ${theme.radii.sm} ${theme.radii.sm} 0 0;
  &:hover { color: ${theme.colors.primary}; }
`;

export default function TalmudView({ initialMasechet = '' }: { initialMasechet?: string }) {
  const [tab, setTab] = useState<Tab>('view');
  const role = useRole();

  return (
    <Wrapper>
      <SubNav>
        <TabBtn $active={tab === 'view'} onClick={() => setTab('view')}>
          {HE.TALMUD_TAB_VIEW}
        </TabBtn>
        {role === 'admin' && (
          <TabBtn $active={tab === 'add'} onClick={() => setTab('add')}>
            {HE.TALMUD_TAB_ADD}
          </TabBtn>
        )}
      </SubNav>

      {tab === 'view' ? <StudyView initialMasechet={initialMasechet} /> : <AddCitation />}
    </Wrapper>
  );
}
