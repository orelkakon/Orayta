'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { numeral } from '@/lib/tehillim/units';
import { SkeletonText } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { ChapterText } from './useUnitText';

/**
 * The unit's verses in the siddur's reading typography (scales with
 * --siddur-scale), each with a small gold verse numeral; a chapter heading
 * whenever the unit spans more than one chapter.
 */
const Column = styled.div`max-width: ${theme.layout.reading}; margin-inline: auto;`;
const Heading = styled.h3`
  margin: 1.2em 0 0.5em; font-family: ${theme.fonts.body}; font-weight: 700;
  font-size: calc(1.1rem * var(--siddur-scale, 1.22)); color: ${theme.colors.primary};
  &:first-child { margin-top: 0; }
`;
const Verse = styled.p`
  margin: 0 0 0.55em; font-family: ${theme.fonts.body}; line-height: 2;
  font-size: calc(1.05rem * var(--siddur-scale, 1.22)); color: ${theme.colors.text}; text-wrap: pretty;
  & > sup {
    margin-inline-end: 6px; font-family: ${theme.fonts.ui}; font-size: max(0.7rem, 0.55em); font-weight: 700;
    color: ${theme.colors.gold}; vertical-align: 0.5em; user-select: none;
  }
`;
const Error = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md}; padding: ${theme.spacing.xl} 0;
  text-align: center; color: ${theme.colors.textMuted};
`;

interface Props { chapters: ChapterText[] | null; failed: boolean; onRetry: () => void; showHeadings: boolean }

export default function UnitText({ chapters, failed, onRetry, showHeadings }: Props) {
  if (failed) {
    return (
      <Error role="alert">
        <span>{HE.TH_TEXT_ERROR}</span>
        <Button $variant="secondary" $size="sm" onClick={onRetry}>{HE.TH_RETRY}</Button>
      </Error>
    );
  }
  if (!chapters) return <Column><SkeletonText lines={8} lineHeight="18px" /></Column>;
  return (
    <Column lang="he">
      {chapters.map(c => (
        <section key={`${c.chapter}-${c.first}`} aria-label={HE.READER_CHAPTER(numeral(c.chapter))}>
          {showHeadings && <Heading>{HE.READER_CHAPTER(numeral(c.chapter))}</Heading>}
          {c.verses.map((v, i) => (
            <Verse key={i}>
              <sup aria-hidden="true">{numeral(c.first + i)}</sup>
              <span dangerouslySetInnerHTML={{ __html: v }} />
            </Verse>
          ))}
        </section>
      ))}
    </Column>
  );
}
