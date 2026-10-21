'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { TERMS } from '@/lib/legal/terms';
import { PRIVACY } from '@/lib/legal/privacy';
import { ACCESSIBILITY } from '@/lib/legal/accessibility';
import { LEGAL_UPDATED } from '@/lib/legal/meta';
import LegalDocument from './LegalDocument';

const DOCS = [TERMS, PRIVACY, ACCESSIBILITY];

const Page = styled.div`
  max-width: 780px; margin: 0 auto; width: 100%;
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
`;

const Hero = styled.header`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.md};
`;

const Title = styled.h1`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h1};
  color: ${theme.colors.primary}; line-height: 1.3;
`;

const Sub = styled.p`
  font-size: ${theme.fontSizes.md}; line-height: 1.7; color: ${theme.colors.textMuted};
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
      <Hero>
        <Title>{HE.LEGAL_TITLE}</Title>
        <Sub>{HE.LEGAL_SUB}</Sub>
        <Updated>{HE.LEGAL_UPDATED_LABEL} <strong>{LEGAL_UPDATED}</strong></Updated>
      </Hero>
      <Jump aria-label={HE.LEGAL_JUMP_ARIA}>
        {DOCS.map(d => <Chip key={d.id} href={`#${d.id}`}>{d.title}</Chip>)}
      </Jump>
      {DOCS.map(d => <LegalDocument key={d.id} doc={d} />)}
    </Page>
  );
}
