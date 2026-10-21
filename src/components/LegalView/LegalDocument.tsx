import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { LegalBlock, LegalDoc } from '@/types';
import RichText from './RichText';

/* Anchors must clear the sticky header and the document chips under it. */
const ANCHOR_OFFSET = 'calc(var(--header-h, 60px) + 72px)';

const Doc = styled.article`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.xl};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
  scroll-margin-top: ${ANCHOR_OFFSET};
  ${theme.media.sm} { padding: ${theme.spacing.lg} ${theme.spacing.md}; }
`;

const DocTitle = styled.h2`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h2};
  color: ${theme.colors.primary};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 2px solid ${theme.colors.secondary};
`;

const Summary = styled.aside`
  background: ${theme.colors.surfaceAlt};
  border-inline-start: 4px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
`;

const SummaryTitle = styled.h3`
  font-size: ${theme.fontSizes.md}; font-weight: 700;
  color: ${theme.colors.text}; margin-bottom: ${theme.spacing.sm};
`;

const Section = styled.section`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  scroll-margin-top: ${ANCHOR_OFFSET};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text};
`;

const Num = styled.span`
  color: ${theme.colors.primaryLight}; margin-inline-end: ${theme.spacing.xs};
  font-variant-numeric: tabular-nums;
`;

const P = styled.p`
  font-size: ${theme.fontSizes.md}; line-height: 1.8; color: ${theme.colors.text};
`;

const List = styled.ul`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  padding-inline-start: ${theme.spacing.lg};
  list-style: disc;
  & > li { font-size: ${theme.fontSizes.md}; line-height: 1.75; color: ${theme.colors.text}; }
  & > li::marker { color: ${theme.colors.secondary}; }
`;

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <P><RichText text={block} /></P>;
  return (
    <List>
      {block.map((item, i) => <li key={i}><RichText text={item} /></li>)}
    </List>
  );
}

export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <Doc id={doc.id} aria-labelledby={`${doc.id}-title`}>
      <DocTitle id={`${doc.id}-title`}>{doc.title}</DocTitle>
      <Summary aria-label={HE.LEGAL_SUMMARY}>
        <SummaryTitle>{HE.LEGAL_SUMMARY}</SummaryTitle>
        <Block block={doc.summary} />
      </Summary>
      {doc.sections.map((s, i) => (
        <Section key={s.title} id={`${doc.id}-${i + 1}`}>
          <SectionTitle><Num>{i + 1}.</Num>{s.title}</SectionTitle>
          {s.blocks.map((b, j) => <Block key={j} block={b} />)}
        </Section>
      ))}
    </Doc>
  );
}
