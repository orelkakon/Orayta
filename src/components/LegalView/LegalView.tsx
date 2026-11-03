'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { TERMS } from '@/lib/legal/terms';
import { PRIVACY } from '@/lib/legal/privacy';
import { ACCESSIBILITY } from '@/lib/legal/accessibility';
import { LEGAL_UPDATED } from '@/lib/legal/meta';
import LegalDocument from './LegalDocument';
import PageHeader from '@/components/ui/PageHeader';

const DOCS = [TERMS, PRIVACY, ACCESSIBILITY];

const Page = styled.div`
  max-width: 780px; margin: 0 auto; width: 100%;
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
`;




const Updated = styled.p`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};
  & > strong { color: ${theme.colors.text}; }
`;

/* Sticky jump bar under the site header — one tap to each document. */
const Jump = styled.nav`
  position: sticky; top: var(--header-h, 60px); z-index: 20;
  margin: 0 -${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background};
  display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap;
`;

const Chip = styled.a`
  flex: 1 1 0; min-width: max-content; min-height: 44px;
  display: inline-flex; align-items: center; justify-content: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 999px;
  border: 1.5px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.text};
  transition: border-color ${theme.motion.fast}, color ${theme.motion.fast};
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;

export default function LegalView() {
  return (
    <Page>
      <PageHeader icon="info" title={HE.LEGAL_TITLE} subtitle={<>{HE.LEGAL_SUB}<br /><Updated>{HE.LEGAL_UPDATED_LABEL} <strong>{LEGAL_UPDATED}</strong></Updated></>} />
      <Jump aria-label={HE.LEGAL_JUMP_ARIA}>
        {DOCS.map(d => <Chip key={d.id} href={`#${d.id}`}>{d.title}</Chip>)}
      </Jump>
      {DOCS.map(d => <LegalDocument key={d.id} doc={d} />)}
    </Page>
  );
}
