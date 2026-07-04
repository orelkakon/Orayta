import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import type { FeedItem, Citation, Rabbi, Book, Chidush, FeedGematriaData, FeedSikumData, RabbiCategory } from '@/types';
import { CATEGORY_LABELS } from '@/lib/rabbisData';

export const MainText = styled.p`
  color: rgba(255,255,255,0.95); font-family: var(--font-frank,serif);
  font-size: 1.25rem; line-height: 1.75; max-width: 95%;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 7; -webkit-box-orient: vertical;
`;

export const BigWord = styled.div`
  color: white; font-family: var(--font-frank,serif);
  font-size: clamp(1.7rem,5.5vw,2.6rem); font-weight: 800;
`;

const BigNum = styled.div`
  color: rgba(255,255,255,0.88); font-family: var(--font-frank,serif);
  font-size: clamp(3rem,11vw,4.5rem); font-weight: 900; line-height: 1;
`;

const SubText = styled.div`color: rgba(255,255,255,0.62); font-size: 0.88rem; line-height: 1.5;`;

const YahrzeitTag = styled.div`
  color: rgba(255,230,180,0.8); font-size: 0.78rem;
  background: rgba(255,200,100,0.1); border-radius: 10px; padding: 3px 10px;
`;

export const RabbiImg = styled.img`
  width: 82px; height: 82px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(255,255,255,0.22); margin-bottom: 4px; cursor: pointer;
  transition: transform 0.15s;
  &:active { transform: scale(0.93); }
`;

const chipBase = `
  background: rgba(255,255,255,0.1); backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.18); border-radius: 14px;
  color: rgba(255,255,255,0.8); font-size: 0.76rem; padding: 4px 11px; white-space: nowrap;
`;

export const MetaChip = styled.div`${chipBase}`;
export const MetaChipLink = styled(Link)`
  ${chipBase} border-color: rgba(255,255,255,0.35); color: rgba(255,255,255,0.95);
  transition: background 0.15s, border-color 0.15s;
  &:hover { background: rgba(255,255,255,0.2); }
  &::after { content: ' ↗'; font-size: 0.68rem; opacity: 0.7; }
`;

export type MetaItem = { label: string; href?: string };

export function renderContent(item: FeedItem, onImgClick: (src: string) => void): { body: React.ReactNode; meta: MetaItem[]; copyText?: string } {
  if (item.type === 'citation') {
    const d = item.data as Citation;
    const meta: MetaItem[] = d.locations.map(l => ({ label: `${l.masechet} · דף ${l.daf}${l.amud ? ` ${l.amud}` : ''}`, href: `/study?masechet=${encodeURIComponent(l.masechet)}` }));
    return { body: <MainText>{d.content}</MainText>, meta, copyText: d.content };
  }
  if (item.type === 'rabbi') {
    const d = item.data as Rabbi;
    return {
      body: <>
        {d.imageUrl && <RabbiImg src={d.imageUrl} alt={d.name}
          onClick={e => { e.stopPropagation(); onImgClick(d.imageUrl!); }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        {item.isYahrzeit && <YahrzeitTag>🕯️ יארצייט היום</YahrzeitTag>}
        <BigWord>{d.name}</BigWord>
        {d.fullName && d.fullName !== d.name && <SubText style={{ fontSize: '0.96rem', opacity: 0.75 }}>{d.fullName}</SubText>}
        {d.deathDate && !item.isYahrzeit && <YahrzeitTag>🕯️ יארצייט: {d.deathDate}</YahrzeitTag>}
        <SubText>{d.datePeriod}</SubText>
        <MainText>{d.bio}</MainText>
      </>,
      meta: [{ label: CATEGORY_LABELS[d.category as RabbiCategory] ?? d.category, href: `/rabbis?q=${encodeURIComponent(d.name)}` }],
    };
  }
  if (item.type === 'book') {
    const d = item.data as Book;
    return { body: <><BigWord>{d.title}</BigWord><SubText>מאת {d.author}</SubText></>, meta: [{ label: d.author, href: `/rabbis?q=${encodeURIComponent(d.author)}` }] };
  }
  if (item.type === 'chidush') {
    const d = item.data as Chidush;
    const meta: MetaItem[] = [d.source, d.author].filter((x): x is string => Boolean(x)).map(s => ({ label: s }));
    return { body: <MainText>{d.text}</MainText>, meta, copyText: d.text };
  }
  if (item.type === 'gematria') {
    const d = item.data as FeedGematriaData;
    const meta: MetaItem[] = d.matches.length > 0 ? [{ label: `ערך שווה: ${d.matches.join(' · ')}`, href: `/gematria?q=${encodeURIComponent(d.word)}` }] : [];
    return { body: <><BigWord>{d.word}</BigWord><BigNum>{d.value}</BigNum><SubText>בגימטריה</SubText></>, meta };
  }
  if (item.type === 'sikum') {
    const d = item.data as FeedSikumData;
    const meta: MetaItem[] = [{ label: `${d.bookIcon ?? '📝'} ${d.bookName}`, href: `/sikumim?q=${encodeURIComponent(d.bookName)}` }];
    if (d.location) meta.push({ label: d.location });
    return { body: <>{d.title && <BigWord>{d.title}</BigWord>}<MainText>{d.text}</MainText></>, meta };
  }
  return { body: null, meta: [] };
}
