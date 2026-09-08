'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { toHebrewNumeral } from '@/lib/hebrewNumerals';
import { TextCard, Loading, CardTitle, CardSubtitle } from './readerStyles';

const Verses = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Verse = styled.div`
  display: flex; gap: ${theme.spacing.sm}; align-items: flex-start;
`;

const VerseNum = styled.span`
  font-size: 0.72rem; color: ${theme.colors.textLight};
  min-width: 22px; padding-top: 4px; flex-shrink: 0; font-weight: 600;
  font-family: ${theme.fonts.body};
`;

const VerseText = styled.p`
  font-family: ${theme.fonts.body}; font-size: 1.05rem; line-height: 1.9;
  color: ${theme.colors.text};
`;

interface Props { verses: string[]; loading: boolean; title?: string; subtitle?: string; }

export default function VersesCard({ verses, loading, title, subtitle }: Props) {
  return (
    <TextCard>
      {title && (
        <CardTitle>
          {title}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardTitle>
      )}
      {loading ? (
        <Loading>{HE.LOADING}</Loading>
      ) : (
        <Verses>
          {verses.map((v, i) => (
            <Verse key={i}>
              <VerseNum>{toHebrewNumeral(i + 1)}</VerseNum>
              <VerseText dangerouslySetInnerHTML={{ __html: v }} />
            </Verse>
          ))}
        </Verses>
      )}
    </TextCard>
  );
}
