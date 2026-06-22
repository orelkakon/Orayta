'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { ContentSection, SefariaBook } from '@/lib/contentsSections';
import SpeakButton from '@/components/common/SpeakButton';

interface SefariaResp { he: string[]; heRef?: string; }

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Controls = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 6px ${theme.spacing.sm}; border-radius: ${theme.radii.sm};
  border: 1.5px solid ${theme.colors.border}; background: ${theme.colors.surface};
  color: ${theme.colors.text}; font-size: 0.88rem; font-family: ${theme.fonts.body};
  &:focus { outline: none; border-color: ${theme.colors.primary}; }
`;

const NavBtn = styled.button`
  padding: 6px 14px; border-radius: ${theme.radii.sm};
  border: 1.5px solid ${theme.colors.border};
  font-size: 0.88rem; color: ${theme.colors.textMuted};
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }
  &:disabled { opacity: 0.3; }
`;

const RefLabel = styled.div`
  font-size: 0.82rem; color: ${theme.colors.textMuted};
  margin-right: auto; font-family: ${theme.fonts.body};
`;

const TextCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`;

const Verses = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Verse = styled.div`
  display: flex; gap: ${theme.spacing.sm}; align-items: flex-start;
`;

const VerseNum = styled.span`
  font-size: 0.72rem; color: ${theme.colors.textLight};
  min-width: 20px; padding-top: 4px; flex-shrink: 0; font-weight: 600;
`;

const VerseText = styled.p`
  font-family: ${theme.fonts.body}; font-size: 1.05rem; line-height: 1.9;
  color: ${theme.colors.text};
`;

const StaticText = styled.p`
  font-family: ${theme.fonts.body}; font-size: 1.1rem; line-height: 2.1;
  color: ${theme.colors.text}; padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;

const Loading = styled.div`
  text-align: center; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl}; font-size: 0.95rem;
`;

interface Props { section: ContentSection; }

export default function ContentReader({ section }: Props) {
  const [book, setBook] = useState<SefariaBook | null>(section.books?.[0] ?? null);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<string[]>([]);
  const [refLabel, setRefLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const maxChapters = book?.chapters ?? section.totalChapters ?? 1;

  useEffect(() => {
    if (section.type === 'static') return;
    const baseRef = book?.ref ?? section.ref ?? '';
    const ref = maxChapters > 1 ? `${baseRef}.${chapter}` : baseRef;
    setLoading(true);
    fetch(`https://www.sefaria.org/api/texts/${ref}?lang=he`)
      .then(r => r.json())
      .then((d: SefariaResp) => {
        setVerses(d.he ?? []);
        setRefLabel(d.heRef ?? '');
      })
      .catch(() => setVerses([]))
      .finally(() => setLoading(false));
  }, [book, chapter, section]);

  // reset chapter on book change
  const handleBookChange = (ref: string) => {
    const b = section.books?.find(b => b.ref === ref) ?? null;
    setBook(b);
    setChapter(1);
  };

  const fullText = verses.join(' ');

  if (section.type === 'static') {
    return (
      <TextCard>
        {section.staticText?.map((line, i) => <StaticText key={i}>{line}</StaticText>)}
      </TextCard>
    );
  }

  return (
    <Wrap>
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
                <option key={i + 1} value={i + 1}>פרק {i + 1}</option>
              ))}
            </Select>
            <NavBtn disabled={chapter >= maxChapters} onClick={() => setChapter(c => c + 1)}>←</NavBtn>
          </>
        )}
        {refLabel && <RefLabel>{refLabel}</RefLabel>}
        {fullText && <SpeakButton text={fullText} />}
      </Controls>

      <TextCard>
        {loading ? (
          <Loading>טוען...</Loading>
        ) : (
          <Verses>
            {verses.map((v, i) => (
              <Verse key={i}>
                <VerseNum>{i + 1}</VerseNum>
                <VerseText dangerouslySetInnerHTML={{ __html: v }} />
              </Verse>
            ))}
          </Verses>
        )}
      </TextCard>
    </Wrap>
  );
}
