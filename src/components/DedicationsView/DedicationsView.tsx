'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import DedicationRequestForm from './DedicationRequestForm';
import DedicationsAdmin from './DedicationsAdmin';
import PageHeader from '@/components/ui/PageHeader';

const Page = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  max-width: 560px; width: 100%; margin: 0 auto;
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

      {role === 'admin' ? <DedicationsAdmin /> : <DedicationRequestForm />}
    </Page>
  );
}
