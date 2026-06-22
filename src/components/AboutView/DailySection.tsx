'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, Citation, Book } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/rabbisData';
import type { RabbiCategory } from '@/types';

const DAY = Math.floor(Date.now() / 86400000);
const pick = <T,>(arr: T[]): T | null => arr.length ? arr[DAY % arr.length] : null;

const Wrapper = styled.div`
  width: 100%; max-width: 560px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const Header = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.borderLight};
  padding-bottom: ${theme.spacing.sm};
`;

const Title = styled.h2`
  font-size: 1rem; font-weight: 600; color: ${theme.colors.textMuted};
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const DayCard = styled.div`
  background: ${theme.colors.surfaceAlt};
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.borderLight};
  padding: ${theme.spacing.md};
  display: flex; flex-direction: column; gap: 5px;
`;

const Label = styled.div`
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
  color: ${theme.colors.textLight}; text-transform: uppercase; margin-bottom: 2px;
`;

const Badge = styled.span<{ $color: string }>`
  font-size: 0.7rem; font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}1A;
  border-radius: ${theme.radii.sm};
  padding: 1px 6px; align-self: flex-start;
`;

const CardTitle = styled.div`
  font-size: 0.9rem; font-weight: 700; color: ${theme.colors.text}; line-height: 1.3;
`;

const CardSub = styled.div`
  font-size: 0.75rem; color: ${theme.colors.secondary}; font-weight: 500;
`;

const Snippet = styled.div`
  font-size: 0.8rem; color: ${theme.colors.textMuted};
  line-height: 1.55; margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default function DailySection() {
  const [rabbi, setRabbi] = useState<Rabbi | null>(null);
  const [citation, setCitation] = useState<Citation | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch('/api/rabbis').then(r => r.json()) as Promise<Rabbi[]>,
      fetch('/api/citations').then(r => r.json()) as Promise<Citation[]>,
      fetch('/api/books').then(r => r.json()) as Promise<Book[]>,
    ]).then(([rs, cs, bs]) => {
      setRabbi(pick(rs));
      setCitation(pick(cs));
      setBook(pick(bs));
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const loc = citation?.locations[0];
  const catColor = rabbi ? CATEGORY_COLORS[rabbi.category as RabbiCategory] : '';
  const catLabel = rabbi ? CATEGORY_LABELS[rabbi.category as RabbiCategory] : '';

  return (
    <Wrapper>
      <Header>
        <span>📅</span>
        <Title>{HE.DAILY_TITLE}</Title>
      </Header>
      <Cards>
        {rabbi && (
          <DayCard>
            <Label>{HE.DAILY_RABBI}</Label>
            <Badge $color={catColor}>{catLabel}</Badge>
            <CardTitle>{rabbi.name}</CardTitle>
            <CardSub>{rabbi.datePeriod}</CardSub>
            <Snippet>{rabbi.bio}</Snippet>
          </DayCard>
        )}
        {citation && loc && (
          <DayCard>
            <Label>{HE.DAILY_CITATION}</Label>
            <CardSub>{loc.masechet} · {loc.daf}{loc.amud ? ` ${loc.amud}` : ''}</CardSub>
            <Snippet>{citation.content}</Snippet>
          </DayCard>
        )}
        {book && (
          <DayCard>
            <Label>{HE.DAILY_BOOK}</Label>
            <CardTitle>{book.title}</CardTitle>
            <CardSub>{book.author}</CardSub>
          </DayCard>
        )}
      </Cards>
    </Wrapper>
  );
}
