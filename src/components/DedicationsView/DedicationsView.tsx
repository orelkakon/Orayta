'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import DedicationRequestForm from './DedicationRequestForm';
import DedicationsAdmin from './DedicationsAdmin';
import PageHeader from '@/components/ui/PageHeader';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.md} 0 ${theme.spacing.xl};
  animation: ${fadeUp} 0.45s ease;
`;




const Divider = styled.div`
  width: 140px; height: 2px;
  background: linear-gradient(90deg, transparent, ${theme.colors.secondary}, transparent);
  border-radius: 2px;
`;

export const TYPE_OPTIONS = [
  { key: 'iluy',     label: HE.DEDICATION_TYPE_ILUY },
  { key: 'refua',    label: HE.DEDICATION_TYPE_REFUA },
  { key: 'hatzlaha', label: HE.DEDICATION_TYPE_HATZLAHA },
  { key: 'zivug',    label: HE.DEDICATION_TYPE_ZIVUG },
];

export function dedicationTypeLabel(key: string): string {
  return TYPE_OPTIONS.find(t => t.key === key)?.label ?? key;
}

export default function DedicationsView() {
  const role = useRole();

  return (
    <Page>
      <PageHeader icon="candle" title={HE.DEDICATIONS_PAGE_TITLE} subtitle={HE.DEDICATIONS_PAGE_SUBTITLE} />

      <Divider />

      {role === 'admin' ? <DedicationsAdmin /> : <DedicationRequestForm />}
    </Page>
  );
}
