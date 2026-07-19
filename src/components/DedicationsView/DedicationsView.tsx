'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import DedicationRequestForm from './DedicationRequestForm';
import DedicationsAdmin from './DedicationsAdmin';

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

const Hero = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; text-align: center;
`;

const Title = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: 1.7rem; font-weight: 700; color: ${theme.colors.primary};
`;

const Subtitle = styled.p`
  font-size: 0.9rem; color: ${theme.colors.textMuted};
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
      <Hero>
        <Title>🕯️ {HE.DEDICATIONS_PAGE_TITLE}</Title>
        <Subtitle>{HE.DEDICATIONS_PAGE_SUBTITLE}</Subtitle>
      </Hero>

      <Divider />

      {role === 'admin' ? <DedicationsAdmin /> : <DedicationRequestForm />}
    </Page>
  );
}
