'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { ContentSection, SefariaBook } from '@/lib/contentsSections';
import type { StaticGroup } from '@/lib/prayers/types';
import { toHebrewNumeral } from '@/lib/hebrewNumerals';
import SpeakButton from '@/components/common/SpeakButton';
import StaticGroupsView from './StaticGroupsView';
import SefariaPrayerView from './SefariaPrayerView';
import SiddurSectionsView from './SiddurSectionsView';
import TikkunHaklaliView from './TikkunHaklaliView';
import VersesCard from './VersesCard';
import { useSefariaChapter } from './useSefariaChapter';
import { useSwipeNav } from '@/components/common/useSwipeNav';
import { Wrap, Controls, Select, NavBtn, JumpBtn, Spacer, Shortcuts, TextCard } from './readerStyles';

const BlessingRow = styled.div`
  display: flex; align-items: flex-start;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;

const BlessingText = styled.p`
  font-family: ${theme.fonts.body}; font-size: 1.05rem; line-height: 2;
  color: ${theme.colors.text};
`;

interface Props { section: ContentSection; }

const isSefariaChapters = (t: ContentSection['type']) => t === 'sefaria-chapters' || t === 'sefaria-books';

export default function ContentReader({ section }: Props) {
  const [book, setBook] = useState<SefariaBook | null>(section.books?.[0] ?? null);
  const [chapter, setChapter] = useState(1);
  const [tikkun, setTikkun] = useState(false);
  const maxChapters = book?.chapters ?? section.totalChapters ?? 1;
  const isTehillim = section.id === 'tehillim';

  const baseRef = book?.ref ?? section.ref ?? '';
  const chapterRef = isSefariaChapters(section.type) && !tikkun
    ? (maxChapters > 1 ? `${baseRef}.${chapter}` : baseRef)
    : null;
  const { verses, refLabel, loading } = useSefariaChapter(chapterRef);
  const swipe = useSwipeNav({
    onNext: () => setChapter(c => c + 1),
    onPrev: () => setChapter(c => c - 1),
    canNext: chapter < maxChapters,
    canPrev: chapter > 1,
    enabled: maxChapters > 1,
  });

  const handleBookChange = (ref: string) => {
    const b = section.books?.find(b => b.ref === ref) ?? null;
    setBook(b);
    setChapter(1);
  };

  if (section.type === 'sefaria-prayer' && section.sefariaRef) {
    return <SefariaPrayerView sefariaRef={section.sefariaRef} />;
  }

  if (section.type === 'static-sections' && section.staticSections) {
    return <SiddurSectionsView sections={section.staticSections} />;
  }

  if (section.type === 'static') {
    const staticGroups = section.staticGroups as StaticGroup[] | undefined;
    return staticGroups
      ? <StaticGroupsView groups={staticGroups} />
      : (
        <TextCard>
          {section.staticText?.map((line, i) => (
            <BlessingRow key={i}>
              <BlessingText>{line}</BlessingText>
            </BlessingRow>
          ))}
        </TextCard>
      );
  }

  if (isTehillim && tikkun) {
    return <TikkunHaklaliView onExit={() => setTikkun(false)} />;
  }

  const fullText = verses.join(' ');

  return (
    <Wrap {...swipe}>
      <Controls>
        {section.books && (
          <Select value={book?.ref ?? ''} onChange={e => handleBookChange(e.target.value)}>
            {section.books.map(b => <option key={b.ref} value={b.ref}>{b.name}</option>)}
          </Select>
        )}
        {maxChapters > 1 && (
          <>
            <NavBtn disabled={chapter <= 1} onClick={() => setChapter(c => c - 1)}>→</NavBtn>
            <Select value={chapter} onChange={e => setChapter(Number(e.target.value))}>
              {Array.from({ length: maxChapters }, (_, i) => (
                <option key={i + 1} value={i + 1}>פרק {toHebrewNumeral(i + 1)}</option>
              ))}
            </Select>
            <NavBtn disabled={chapter >= maxChapters} onClick={() => setChapter(c => c + 1)}>←</NavBtn>
          </>
        )}
        <Spacer />
        {fullText && <SpeakButton text={fullText} />}
      </Controls>

      {isTehillim && (
        <Shortcuts>
          <JumpBtn disabled={chapter === 100} onClick={() => setChapter(100)} title={HE.TEHILLIM_TODAH_TITLE}>
            {HE.TEHILLIM_TODAH_BTN}
          </JumpBtn>
          <JumpBtn onClick={() => setTikkun(true)} title={HE.TIKKUN_BTN_TITLE}>
            {HE.TIKKUN_BTN}
          </JumpBtn>
        </Shortcuts>
      )}

      <VersesCard verses={verses} loading={loading} title={loading ? undefined : refLabel} />
    </Wrap>
  );
}
