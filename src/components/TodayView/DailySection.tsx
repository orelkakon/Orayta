'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, Citation, Chidush } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/rabbisData';
import type { RabbiCategory } from '@/types';
import { matchYahrzeitRabbis, HebDateParts } from '@/lib/yahrzeit';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { shareDailyToWhatsApp, shareDailyToStory, DailySikum } from '@/lib/dailyShare';
import { LineIcon } from '@/components/common/LineIcons';
import ExpandableSnippet from './ExpandableSnippet';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const DAY = Math.floor(Date.now() / 86400000);
const pick = <T,>(arr: T[]): T | null => arr.length ? arr[DAY % arr.length] : null;

type HebConverterResp = HebDateParts;

const Wrapper = styled.section`scroll-margin-top: calc(var(--header-h, 56px) + 12px); width: 100%; display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Header = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
`;

const Title = styled.h2`flex: 1; font-size: ${theme.fontSizes.xl}; color: ${theme.colors.text};`;

const Cards = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr); gap: ${theme.spacing.sm};
  ${theme.up.sm} { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const DayCard = styled.div`
  background: ${theme.colors.surface}; border-radius: 18px;
  border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md}; display: flex; flex-direction: column; gap: 5px;
`;

const Label = styled.div`
  font-size: ${theme.fontSizes.xs}; font-weight: 700;
  color: ${theme.colors.secondaryText}; margin-bottom: 2px;
`;

const Badge = styled.span<{ $color: string }>`
  font-size: 0.7rem; font-weight: 600;
  color: ${({ $color }) => $color}; background: ${({ $color }) => $color}1A;
  border-radius: ${theme.radii.sm}; padding: 1px 6px; align-self: flex-start;
`;

const CardTitle = styled.div`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text}; line-height: 1.3;`;
const CardSub = styled.div`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; font-weight: 500;`;

const Divider = styled.div`
  height: 1px; background: ${theme.colors.borderLight}; margin: 4px 0;
`;

const SkelGrid = styled(Cards)`& > span { border-radius: 18px; }`;

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
    void Promise.allSettled([
      fetch('/api/rabbis').then(r => r.json()) as Promise<Rabbi[]>,
      fetch('/api/citations').then(r => r.json()) as Promise<Citation[]>,
      fetch('/api/sikum-entries/daily').then(r => r.json()) as Promise<DailySikum | null>,
      fetch('/api/chidushim').then(r => r.json()) as Promise<Chidush[]>,
      fetch(`https://www.hebcal.com/converter?cfg=json&date=${dateStr}&g2h=1&strict=1`)
        .then(r => r.json() as Promise<HebConverterResp>),
    ]).then(([rsR, csR, skR, chsR, hdR]) => {
      const rs = rsR.status === 'fulfilled' ? rsR.value : [];
      const cs = csR.status === 'fulfilled' ? csR.value : [];
      const sk = skR.status === 'fulfilled' ? skR.value : null;
      const chs = chsR.status === 'fulfilled' ? chsR.value : [];
      const hd = hdR.status === 'fulfilled' ? hdR.value : null;
      setRabbi(pick(rs));
      setCitation(pick(cs));
      setSikum(sk);
      setChidush(pick(chs));
      setHebrewDate(formatHebrewDate(today, true));
      if (hd) {
        setYahrzeitNames(matchYahrzeitRabbis(rs, hd).map(r => r.name));
      }
      setReady(true);
    });
  }, []);

  // Linked from home (/today#daily): land on this section once it has its
  // real height (the cards above load in parallel and shift the page).
  useEffect(() => {
    if (!ready || window.location.hash !== '#daily') return;
    const t = window.setTimeout(() => document.getElementById('daily')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    return () => window.clearTimeout(t);
  }, [ready]);

  if (!ready) {
    return (
      <Wrapper id="daily" aria-busy="true" aria-label={HE.LOADING}>
        <SkelGrid>{[0, 1, 2, 3].map(i => <Skeleton key={i} $h="150px" />)}</SkelGrid>
      </Wrapper>
    );
  }

  /* Every source failed — keep the pre-existing "no section" behavior. */
  if (!rabbi && !citation && !sikum && !chidush) return null;

  const loc = citation?.locations[0];
  const catColor = rabbi ? CATEGORY_COLORS[rabbi.category as RabbiCategory] : '';
  const catLabel = rabbi ? CATEGORY_LABELS[rabbi.category as RabbiCategory] : '';

  const handleShare = () => shareDailyToWhatsApp({
    hebrewDate, rabbi, citation, sikum, chidush, yahrzeitNames,
  });

  return (
    <Wrapper id="daily">
      <Header>
        <Title>{HE.DAILY_TITLE}</Title>
        <Button $variant="secondary" $size="sm" onClick={handleShare}>
          <LineIcon name="send" size={16} strokeWidth={1.9} />{HE.DAILY_SHARE_WA}
        </Button>
        <Button $variant="secondary" $size="sm" onClick={() => void shareDailyToStory({ hebrewDate, rabbi, citation, sikum, chidush, yahrzeitNames })}>
          <LineIcon name="camera" size={16} strokeWidth={1.9} />{HE.STORY_SHARE_IG}
        </Button>
      </Header>
      <Cards>
        {/* Combined rabbi + book card */}
        {rabbi && (
          <DayCard>
            <Label>{HE.DAILY_RABBI_AND_BOOK}</Label>
            <Badge $color={catColor}>{catLabel}</Badge>
            <CardTitle>{rabbi.name}</CardTitle>
            <CardSub>{rabbi.datePeriod}</CardSub>
            <ExpandableSnippet text={rabbi.bio} />
          </DayCard>
        )}

        {citation && loc && (
          <DayCard>
            <Label>{HE.DAILY_CITATION}</Label>
            <CardSub>{loc.masechet} · {loc.daf}{loc.amud ? ` ${loc.amud}` : ''}</CardSub>
            <ExpandableSnippet text={citation.content} />
          </DayCard>
        )}

        {sikum && (
          <DayCard>
            <Label>{HE.DAILY_SIKUM}</Label>
            <CardTitle>{sikum.book.name}</CardTitle>
            {sikum.book.author && <CardSub>{sikum.book.author}</CardSub>}
            <Divider />
            {sikum.title && <CardSub>{sikum.title}</CardSub>}
            <ExpandableSnippet text={sikum.text} />
          </DayCard>
        )}

        {chidush && (
          <DayCard>
            <Label>{HE.DAILY_CHIDUSH}</Label>
            {chidush.author && <CardTitle>{chidush.author}</CardTitle>}
            {chidush.source && <CardSub>{chidush.source}</CardSub>}
            <ExpandableSnippet text={chidush.text} />
          </DayCard>
        )}
      </Cards>
    </Wrapper>
  );
}
