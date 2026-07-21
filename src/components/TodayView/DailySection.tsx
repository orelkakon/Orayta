'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, Citation, Chidush } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/rabbisData';
import type { RabbiCategory } from '@/types';
import { matchYahrzeitRabbis, HebDateParts } from '@/lib/yahrzeit';
import { shareDailyToWhatsApp, shareDailyToStory, DailySikum } from '@/lib/dailyShare';

const DAY = Math.floor(Date.now() / 86400000);
const pick = <T,>(arr: T[]): T | null => arr.length ? arr[DAY % arr.length] : null;

interface HebConverterResp extends HebDateParts { hebrew: string; }

const Wrapper = styled.div`width: 100%; display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Header = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.borderLight}; padding-bottom: ${theme.spacing.sm};
`;

const Title = styled.h2`font-size: 1rem; font-weight: 600; color: ${theme.colors.textMuted};`;

const ShareBtn = styled.button`
  margin-inline-start: auto;
  display: inline-flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, #25D366 0%, #1DA851 100%);
  color: white; font-size: 0.8rem; font-weight: 700;
  padding: 6px 14px; border-radius: 20px;
  box-shadow: ${theme.shadows.sm};
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: translateY(-1px); box-shadow: ${theme.shadows.md}; }
  &:active { transform: scale(0.96); }
`;

const StoryBtn = styled(ShareBtn)`
  margin-inline-start: ${theme.spacing.sm};
  background: linear-gradient(45deg, #f09433, #dc2743, #bc1888);
`;

const Cards = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: ${theme.spacing.sm};
  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 400px) { grid-template-columns: 1fr; }
`;

const DayCard = styled.div`
  background: ${theme.colors.surfaceAlt}; border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.borderLight};
  padding: ${theme.spacing.md}; display: flex; flex-direction: column; gap: 5px;
`;

const Label = styled.div`
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
  color: ${theme.colors.textLight}; margin-bottom: 2px;
`;

const Badge = styled.span<{ $color: string }>`
  font-size: 0.7rem; font-weight: 600;
  color: ${({ $color }) => $color}; background: ${({ $color }) => $color}1A;
  border-radius: ${theme.radii.sm}; padding: 1px 6px; align-self: flex-start;
`;

const CardTitle = styled.div`font-size: 0.9rem; font-weight: 700; color: ${theme.colors.text}; line-height: 1.3;`;
const CardSub = styled.div`font-size: 0.75rem; color: ${theme.colors.secondary}; font-weight: 500;`;
const Snippet = styled.div`font-size: 0.8rem; color: ${theme.colors.textMuted}; line-height: 1.55; margin-top: 2px;`;

const Divider = styled.div`
  height: 1px; background: ${theme.colors.borderLight}; margin: 4px 0;
`;

export default function DailySection() {
  const [rabbi, setRabbi] = useState<Rabbi | null>(null);
  const [citation, setCitation] = useState<Citation | null>(null);
  const [sikum, setSikum] = useState<DailySikum | null>(null);
  const [chidush, setChidush] = useState<Chidush | null>(null);
  const [yahrzeitNames, setYahrzeitNames] = useState<string[]>([]);
  const [hebrewDate, setHebrewDate] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    void Promise.all([
      fetch('/api/rabbis').then(r => r.json()) as Promise<Rabbi[]>,
      fetch('/api/citations').then(r => r.json()) as Promise<Citation[]>,
      fetch('/api/sikum-entries/daily').then(r => r.json()) as Promise<DailySikum | null>,
      fetch('/api/chidushim').then(r => r.json()) as Promise<Chidush[]>,
      fetch(`https://www.hebcal.com/converter?cfg=json&date=${dateStr}&g2h=1&strict=1`)
        .then(r => r.json() as Promise<HebConverterResp>).catch(() => null),
    ]).then(([rs, cs, sk, chs, hd]) => {
      setRabbi(pick(rs));
      setCitation(pick(cs));
      setSikum(sk);
      setChidush(pick(chs));
      if (hd) {
        setHebrewDate(hd.hebrew ?? '');
        setYahrzeitNames(matchYahrzeitRabbis(rs, hd).map(r => r.name));
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const loc = citation?.locations[0];
  const catColor = rabbi ? CATEGORY_COLORS[rabbi.category as RabbiCategory] : '';
  const catLabel = rabbi ? CATEGORY_LABELS[rabbi.category as RabbiCategory] : '';

  const handleShare = () => shareDailyToWhatsApp({
    hebrewDate, rabbi, citation, sikum, chidush, yahrzeitNames,
  });

  return (
    <Wrapper>
      <Header>
        <span>📅</span>
        <Title>{HE.DAILY_TITLE}</Title>
        <ShareBtn onClick={handleShare}>💬 {HE.DAILY_SHARE_WA}</ShareBtn>
        <StoryBtn onClick={() => void shareDailyToStory({ hebrewDate, rabbi, citation, sikum, chidush, yahrzeitNames })}>
          📸 {HE.STORY_SHARE_IG}
        </StoryBtn>
      </Header>
      <Cards>
        {/* Combined rabbi + book card */}
        {rabbi && (
          <DayCard>
            <Label>{HE.DAILY_RABBI_AND_BOOK}</Label>
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

        {sikum && (
          <DayCard>
            <Label>{HE.DAILY_SIKUM}</Label>
            <CardTitle>{sikum.book.name}</CardTitle>
            {sikum.book.author && <CardSub>{sikum.book.author}</CardSub>}
            <Divider />
            {sikum.title && <CardTitle style={{ fontSize: '0.82rem' }}>{sikum.title}</CardTitle>}
            <Snippet>{sikum.text}</Snippet>
          </DayCard>
        )}

        {chidush && (
          <DayCard>
            <Label>{HE.DAILY_CHIDUSH}</Label>
            {chidush.author && <CardTitle>{chidush.author}</CardTitle>}
            {chidush.source && <CardSub>{chidush.source}</CardSub>}
            <Snippet>{chidush.text}</Snippet>
          </DayCard>
        )}
      </Cards>
    </Wrapper>
  );
}
