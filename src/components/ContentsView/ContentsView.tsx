'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SECTIONS, ContentSection } from '@/lib/contentsSections';
import ContentReader from './ContentReader';

const Page = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Header = styled.div`display: flex; align-items: center; gap: ${theme.spacing.md};`;

const BackBtn = styled.button`
  font-size: 0.88rem; color: ${theme.colors.textMuted};
  display: flex; align-items: center; gap: 4px;
  padding: 4px ${theme.spacing.sm}; border-radius: ${theme.radii.sm};
  border: 1px solid ${theme.colors.border};
  transition: all 0.15s;
  &:hover { color: ${theme.colors.primary}; border-color: ${theme.colors.primary}; }
`;

const Title = styled.h1`font-size: 1.8rem; color: ${theme.colors.primary};`;
const Subtitle = styled.p`font-size: 0.95rem; color: ${theme.colors.textMuted};`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.sm};
  @media (max-width: 700px) { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
`;

const SectionCard = styled.button`
  background: ${theme.colors.surface};
  border: 1.5px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.xs};
  box-shadow: ${theme.shadows.sm};
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; text-align: center; cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
  &:hover {
    box-shadow: ${theme.shadows.md}; transform: translateY(-2px);
    border-color: ${theme.colors.secondary};
  }
`;

const CardIcon = styled.div`font-size: 1.6rem; line-height: 1;`;

const CardTitle = styled.div`
  font-family: ${theme.fonts.body}; font-size: 0.82rem; font-weight: 700;
  color: ${theme.colors.primary}; line-height: 1.3;
`;

const CardDesc = styled.div`font-size: 0.7rem; color: ${theme.colors.textMuted}; line-height: 1.3;`;

const ReaderHeader = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.borderLight};
`;

const SectionTitle = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: 1.4rem; font-weight: 700;
  color: ${theme.colors.primary};
`;

export default function ContentsView() {
  const [active, setActive] = useState<ContentSection | null>(null);

  if (active) {
    return (
      <Page>
        <ReaderHeader>
          <BackBtn onClick={() => setActive(null)}>← {HE.CLOSE}</BackBtn>
          <SectionTitle>
            <span>{active.icon}</span>
            <span>{active.title}</span>
          </SectionTitle>
        </ReaderHeader>
        <ContentReader section={active} />
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <div>
          <Title>📚 {HE.CONTENTS_TITLE}</Title>
          <Subtitle>{HE.CONTENTS_SUBTITLE}</Subtitle>
        </div>
      </Header>
      <Grid>
        {SECTIONS.map(s => (
          <SectionCard key={s.id} onClick={() => setActive(s)}>
            <CardIcon>{s.icon}</CardIcon>
            <CardTitle>{s.title}</CardTitle>
            <CardDesc>{s.desc}</CardDesc>
          </SectionCard>
        ))}
      </Grid>
    </Page>
  );
}
