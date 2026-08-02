import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import type { FeedItem, Citation, Rabbi, Book, Chidush, FeedGematriaData, FeedSikumData, RabbiCategory } from '@/types';
import { CATEGORY_LABELS } from '@/lib/rabbisData';
import ClampText from './FeedClampText';
import { FEED_TYPE_STYLES, FEED_GOLD } from './feedTypes';
import { LineIcon } from '@/components/common/LineIcons';

export const BigWord = styled.div`
  color: #FFFDF6; font-family: var(--font-frank, serif);
  font-size: clamp(1.7rem, 5.5vw, 2.6rem); font-weight: 800;
  text-shadow: 0 2px 30px rgba(0,0,0,0.45);
`;

const BigNum = styled.div`
  font-family: var(--font-frank, serif);
  font-size: clamp(3rem, 11vw, 4.5rem); font-weight: 900; line-height: 1;
  background: linear-gradient(180deg, #FFFFFF 10%, rgba(${FEED_TYPE_STYLES.gematria.accent}, 0.8) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`;

const QuoteMark = styled.div<{ $accent?: string }>`
  color: rgba(${p => p.$accent ?? FEED_GOLD}, 0.5); font-family: var(--font-frank, serif);
  font-size: 2.7rem; font-weight: 800; line-height: 0.5; margin-bottom: -2px;
  text-shadow: 0 0 26px rgba(${p => p.$accent ?? FEED_GOLD}, 0.35);
`;

const Attribution = styled.div`
  font-family: var(--font-frank, serif); font-size: 0.95rem; font-weight: 600;
  color: rgba(${FEED_GOLD}, 0.8);
`;

/* A drawn sefer — spine on the right (Hebrew books open right-to-left),
   inner frame, title set on the cover itself. Replaces the bare title+author
   that read as a database row. */
const BookCover = styled.div`
  position: relative; width: 132px; height: 180px; margin: 0 auto 8px;
  border-radius: 10px 4px 4px 10px;
  background: linear-gradient(115deg, #103421 0%, #17472F 55%, #0C2618 100%);
  border: 1px solid rgba(${FEED_TYPE_STYLES.book.accent}, 0.45);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(0, 0, 0, 0.25);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 16px 14px;
  &::before {
    content: ''; position: absolute; top: 0; bottom: 0; right: 9px; width: 1px;
    background: rgba(${FEED_TYPE_STYLES.book.accent}, 0.4);
    box-shadow: -3px 0 8px rgba(0, 0, 0, 0.4);
  }
  &::after {
    content: ''; position: absolute; inset: 7px; border-radius: 5px;
    border: 1px solid rgba(${FEED_TYPE_STYLES.book.accent}, 0.25);
    pointer-events: none;
  }
`;

const BookCoverOrn = styled.span`
  color: rgba(${FEED_TYPE_STYLES.book.accent}, 0.75); font-size: 0.7rem; line-height: 1;
`;

const BookCoverTitle = styled.div<{ $long: boolean }>`
  font-family: var(--font-frank, serif); font-weight: 800; text-align: center;
  font-size: ${p => (p.$long ? '0.92rem' : '1.08rem')}; line-height: 1.4;
  color: #F2FBF2; overflow: hidden; max-height: 100%;
`;

const SubText = styled.div`color: rgba(255,248,235,0.6); font-size: 0.9rem; line-height: 1.6;`;

const YahrzeitTag = styled.div`
  color: rgba(255,230,180,0.85); font-size: 0.78rem;
  background: rgba(255,200,100,0.1); border: 1px solid rgba(255,200,100,0.22);
  border-radius: 999px; padding: 4px 12px;
  display: inline-flex; align-items: center; gap: 5px;
`;

export const RabbiImg = styled.img`
  width: 94px; height: 94px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(${FEED_GOLD}, 0.55); margin-bottom: 4px; cursor: pointer;
  box-shadow: 0 0 0 5px rgba(${FEED_GOLD}, 0.1), 0 10px 34px rgba(0,0,0,0.45);
  transition: transform 0.15s;
  &:active { transform: scale(0.93); }
`;

const chipBase = `
  background: rgba(255,255,255,0.07); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.14); border-radius: 999px;
  color: rgba(255,252,242,0.82); font-size: 0.78rem; padding: 5px 13px; white-space: nowrap;
`;

export const MetaChip = styled.div`${chipBase}`;
export const MetaChipLink = styled(Link)`
  ${chipBase} border-color: rgba(${FEED_GOLD}, 0.38); color: rgba(255,250,238,0.95);
  transition: background 0.15s, border-color 0.15s;
  &:hover { background: rgba(${FEED_GOLD}, 0.12); }
  &::after { content: ' ↗'; font-size: 0.68rem; opacity: 0.7; }
`;

export type MetaItem = { label: string; href?: string };
export type ReaderPayload = { title?: string; text: string; href?: string };

export function renderContent(
  item: FeedItem,
  onImgClick: (src: string) => void,
  onExpand: (reader: ReaderPayload) => void,
): { body: React.ReactNode; meta: MetaItem[]; copyText?: string } {
  if (item.type === 'citation') {
    const d = item.data as Citation;
    const meta: MetaItem[] = d.locations.map(l => ({ label: `${l.masechet} · דף ${l.daf}${l.amud ? ` ${l.amud}` : ''}`, href: `/study?masechet=${encodeURIComponent(l.masechet)}` }));
    return {
      body: <>
        <QuoteMark aria-hidden>״</QuoteMark>
        <ClampText text={d.content} onExpand={() => onExpand({ title: meta[0]?.label, text: d.content, href: meta[0]?.href })} />
      </>,
      meta, copyText: d.content,
    };
  }
  if (item.type === 'rabbi') {
    const d = item.data as Rabbi;
    const href = `/rabbis?q=${encodeURIComponent(d.name)}`;
    return {
      body: <>
        {d.imageUrl && <RabbiImg src={d.imageUrl} alt={d.name}
          onClick={e => { e.stopPropagation(); onImgClick(d.imageUrl!); }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        {item.isYahrzeit && <YahrzeitTag><LineIcon name="candle" size={13} /> יארצייט היום</YahrzeitTag>}
        <BigWord>{d.name}</BigWord>
        {d.fullName && d.fullName !== d.name && <SubText style={{ fontSize: '0.96rem', opacity: 0.75 }}>{d.fullName}</SubText>}
        {d.deathDate && !item.isYahrzeit && <YahrzeitTag><LineIcon name="candle" size={13} /> יארצייט: {d.deathDate}</YahrzeitTag>}
        <SubText>{d.datePeriod}</SubText>
        <ClampText text={d.bio} onExpand={() => onExpand({ title: d.name, text: d.bio, href })} />
      </>,
      meta: [{ label: CATEGORY_LABELS[d.category as RabbiCategory] ?? d.category, href }],
      copyText: `${d.name} (${d.datePeriod})\n${d.bio}`,
    };
  }
  if (item.type === 'book') {
    const d = item.data as Book;
    return {
      body: <>
        <BookCover>
          <BookCoverOrn aria-hidden>✦</BookCoverOrn>
          <BookCoverTitle $long={d.title.length > 18}>{d.title}</BookCoverTitle>
          <BookCoverOrn aria-hidden>✦</BookCoverOrn>
        </BookCover>
        <SubText>מאת {d.author}</SubText>
      </>,
      meta: [{ label: d.author, href: `/rabbis?q=${encodeURIComponent(d.author)}` }],
      copyText: `${d.title} — ${d.author}`,
    };
  }
  if (item.type === 'chidush') {
    const d = item.data as Chidush;
    const href = `/chidushim?q=${encodeURIComponent(d.text.slice(0, 25).trim())}`;
    const meta: MetaItem[] = [
      ...(d.source ? [{ label: d.source, href: `/chidushim?q=${encodeURIComponent(d.source)}` }] : []),
    ];
    return {
      body: <>
        <QuoteMark $accent={FEED_TYPE_STYLES.chidush.accent} aria-hidden>״</QuoteMark>
        <ClampText text={d.text} onExpand={() => onExpand({ title: d.source ?? undefined, text: d.text, href })} />
        {d.author && <Attribution>— {d.author}</Attribution>}
      </>,
      meta, copyText: d.text,
    };
  }
  if (item.type === 'gematria') {
    const d = item.data as FeedGematriaData;
    const meta: MetaItem[] = d.matches.length > 0 ? [{ label: `ערך שווה: ${d.matches.join(' · ')}`, href: `/gematria?q=${encodeURIComponent(d.word)}` }] : [];
    return { body: <><BigWord>{d.word}</BigWord><BigNum>{d.value}</BigNum><SubText>בגימטריה</SubText></>, meta, copyText: `${d.word} = ${d.value} בגימטריה` };
  }
  if (item.type === 'sikum') {
    const d = item.data as FeedSikumData;
    const href = `/sikumim?q=${encodeURIComponent(d.bookName)}`;
    const meta: MetaItem[] = [{ label: d.bookName, href }];
    if (d.location) meta.push({ label: d.location });
    return {
      body: <>
        {d.title && <BigWord>{d.title}</BigWord>}
        <ClampText text={d.text} onExpand={() => onExpand({ title: d.title || d.bookName, text: d.text, href })} />
      </>,
      meta,
      copyText: d.text,
    };
  }
  return { body: null, meta: [] };
}
