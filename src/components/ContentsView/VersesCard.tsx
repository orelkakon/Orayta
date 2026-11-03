'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { toHebrewNumeral } from '@/lib/hebrewNumerals';
import { sanitizeSiddurHtml } from '@/lib/siddur/sanitize';
import { SkeletonText } from '@/components/ui/Skeleton';
import { TextCard, Loading, CardTitle, CardSubtitle } from './readerStyles';

const Verses = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Verse = styled.div`
  display: flex; gap: ${theme.spacing.sm}; align-items: flex-start;
`;

const VerseNum = styled.span`
  font-size: calc(0.66rem * var(--siddur-scale, 1.22)); color: ${theme.colors.secondaryText};
  min-width: 22px; padding-top: 0.55em; flex-shrink: 0; font-weight: 700;
  font-family: ${theme.fonts.body};
`;

const VerseText = styled.p`
  font-family: ${theme.fonts.body}; font-size: calc(1.05rem * var(--siddur-scale, 1.22)); line-height: 2;
  color: ${theme.colors.text}; text-wrap: pretty;
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
        <Loading aria-busy="true" aria-label={HE.LOADING}><SkeletonText lines={6} lineHeight="18px" /></Loading>
      ) : (
        <Verses>
          {verses.map((v, i) => (
            <Verse key={i}>
              <VerseNum>{toHebrewNumeral(i + 1)}</VerseNum>
              <VerseText dangerouslySetInnerHTML={{ __html: sanitizeSiddurHtml(v) }} />
            </Verse>
          ))}
        </Verses>
      )}
    </TextCard>
  );
}
