'use client';

import React from 'react';
import styled from 'styled-components';
import type { FeedItem, Citation, Rabbi, Book, Chidush, FeedGematriaData, FeedSikumData, RabbiCategory } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { CATEGORY_LABELS } from '@/lib/rabbisData';

const TYPE_CONFIG: Record<string, { icon: string; label: string; grad: string }> = {
  citation: { icon: '📜', label: HE.FEED_TYPE_CITATION, grad: 'linear-gradient(160deg,#050a1e 0%,#0d1a52 60%,#1a2a7a 100%)' },
  rabbi:    { icon: '👥', label: HE.FEED_TYPE_RABBI,    grad: 'linear-gradient(160deg,#150800 0%,#3d1e00 60%,#6b3200 100%)' },
  book:     { icon: '📚', label: HE.FEED_TYPE_BOOK,     grad: 'linear-gradient(160deg,#041008 0%,#0a2e14 60%,#114022 100%)' },
  chidush:  { icon: '💡', label: HE.FEED_TYPE_CHIDUSH,  grad: 'linear-gradient(160deg,#120800 0%,#3d1800 60%,#6b2800 100%)' },
  gematria: { icon: '🔢', label: HE.FEED_TYPE_GEMATRIA, grad: 'linear-gradient(160deg,#06021a 0%,#140852 60%,#220d8c 100%)' },
  sikum:    { icon: '📝', label: HE.FEED_TYPE_SIKUM,    grad: 'linear-gradient(160deg,#12041a 0%,#320a40 60%,#4a1060 100%)' },
};

const Slide = styled.div<{ $grad: string }>`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: ${p => p.$grad}; position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  &::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.04), transparent 70%);
  }
`;

const TypeBadge = styled.div`
  position: absolute; top: 68px; right: 16px;
  background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.88); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 5px 12px; border-radius: 20px; display: flex; gap: 6px; align-items: center;
  border: 1px solid rgba(255,255,255,0.14);
`;

const ContentArea = styled.div`
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; align-items: center; text-align: center;
  padding: 72px 16px 150px 16px; gap: 12px;
`;

const MainText = styled.p`
  color: rgba(255,255,255,0.95); font-family: var(--font-frank,serif);
  font-size: 1.25rem; line-height: 1.75; max-width: 95%;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 7; -webkit-box-orient: vertical;
`;

const BigWord = styled.div`
  color: white; font-family: var(--font-frank,serif);
  font-size: clamp(1.7rem,5.5vw,2.6rem); font-weight: 800;
`;

const BigNum = styled.div`
  color: rgba(255,255,255,0.88); font-family: var(--font-frank,serif);
  font-size: clamp(3rem,11vw,4.5rem); font-weight: 900; line-height: 1;
`;

const SubText = styled.div`color: rgba(255,255,255,0.62); font-size: 0.88rem; line-height: 1.5;`;

const MetaRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 10px;
`;

const MetaChip = styled.div`
  background: rgba(255,255,255,0.1); backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.18); border-radius: 14px;
  color: rgba(255,255,255,0.8); font-size: 0.76rem; padding: 4px 11px; white-space: nowrap;
`;

const RabbiImg = styled.img`
  width: 82px; height: 82px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(255,255,255,0.22); margin-bottom: 4px;
`;

const YahrzeitTag = styled.div`
  color: rgba(255,230,180,0.8); font-size: 0.78rem;
  background: rgba(255,200,100,0.1); border-radius: 10px; padding: 3px 10px;
`;

const Actions = styled.div`
  position: absolute; left: 14px; bottom: 28px;
  display: flex; flex-direction: column; gap: 22px; align-items: center;
`;

const ActionGroup = styled.div`display: flex; flex-direction: column; align-items: center; gap: 3px;`;

const ActionBtn = styled.button<{ $liked?: boolean }>`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; padding: 4px; background: none; border: none; color: white;
  font-size: 2rem; line-height: 1;
  filter: ${p => p.$liked ? 'drop-shadow(0 0 10px rgba(240,60,60,0.9))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'};
  transition: transform 0.15s, filter 0.15s;
  &:active { transform: scale(0.82); }
`;

const ActionCount = styled.span`color: rgba(255,255,255,0.8); font-size: 0.72rem; font-weight: 700;`;

function ShareIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );
}

function doShare(text: string) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ text, title: HE.FEED_TITLE }).catch(() => {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    });
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
}

function buildShareText(item: FeedItem): string {
  const sig = `\n— אורייתא`;
  if (item.type === 'citation') { const d = item.data as Citation; const l = d.locations[0]; return `"${d.content.slice(0,250)}"${l ? ` (${l.masechet} דף ${l.daf})` : ''}${sig}`; }
  if (item.type === 'rabbi')    { const d = item.data as Rabbi;    return `${d.name} (${d.datePeriod})\n${d.bio.slice(0,200)}${sig}`; }
  if (item.type === 'book')     { const d = item.data as Book;     return `${d.title} — ${d.author}${sig}`; }
  if (item.type === 'chidush')  { const d = item.data as Chidush;  return `${d.text.slice(0,250)}${d.source ? `\n(${d.source})` : ''}${sig}`; }
  if (item.type === 'gematria') { const d = item.data as FeedGematriaData; return `${d.word} = ${d.value} בגימטריה${sig}`; }
  if (item.type === 'sikum')    { const d = item.data as FeedSikumData; return `${d.bookName}${d.title ? ` — ${d.title}` : ''}\n${d.text.slice(0,250)}${sig}`; }
  return sig;
}

function renderContent(item: FeedItem): { body: React.ReactNode; meta: string[] } {
  if (item.type === 'citation') {
    const d = item.data as Citation;
    return { body: <MainText>{d.content}</MainText>, meta: d.locations.map(l => `${l.masechet} · דף ${l.daf}${l.amud ? ` ${l.amud}` : ''}`) };
  }
  if (item.type === 'rabbi') {
    const d = item.data as Rabbi;
    return {
      body: <>
        {d.imageUrl && <RabbiImg src={d.imageUrl} alt={d.name} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />}
        <BigWord>{d.name}</BigWord>
        {d.deathDate && <YahrzeitTag>🕯️ יארצייט: {d.deathDate}</YahrzeitTag>}
        <SubText>{d.datePeriod}</SubText>
        <MainText>{d.bio}</MainText>
      </>,
      meta: [CATEGORY_LABELS[d.category as RabbiCategory] ?? d.category],
    };
  }
  if (item.type === 'book')    { const d = item.data as Book;    return { body: <><BigWord>{d.title}</BigWord><SubText>מאת {d.author}</SubText></>, meta: [] }; }
  if (item.type === 'chidush') { const d = item.data as Chidush; return { body: <MainText>{d.text}</MainText>, meta: [d.source, d.author].filter((x): x is string => Boolean(x)) }; }
  if (item.type === 'gematria') {
    const d = item.data as FeedGematriaData;
    return {
      body: <><BigWord>{d.word}</BigWord><BigNum>{d.value}</BigNum><SubText>בגימטריה</SubText></>,
      meta: d.matches.length > 0 ? [`ערך שווה: ${d.matches.join(' · ')}`] : [],
    };
  }
  if (item.type === 'sikum') {
    const d = item.data as FeedSikumData;
    const meta = [`${d.bookIcon ?? '📝'} ${d.bookName}`];
    if (d.location) meta.push(d.location);
    return { body: <>{d.title && <BigWord>{d.title}</BigWord>}<MainText>{d.text}</MainText></>, meta };
  }
  return { body: null, meta: [] };
}

interface Props { item: FeedItem; isLiked: boolean; onLike: (item: FeedItem) => void; }

export default function FeedCard({ item, isLiked, onLike }: Props) {
  const cfg = TYPE_CONFIG[item.type];
  const { body, meta } = renderContent(item);
  return (
    <Slide $grad={cfg.grad}>
      <TypeBadge>{cfg.icon} {cfg.label}</TypeBadge>
      <ContentArea>
        {body}
        {meta.length > 0 && <MetaRow>{meta.map((m, i) => <MetaChip key={i}>{m}</MetaChip>)}</MetaRow>}
      </ContentArea>
      <Actions>
        <ActionGroup>
          <ActionBtn $liked={isLiked} onClick={() => onLike(item)}>{isLiked ? '❤️' : '🤍'}</ActionBtn>
          {item.likes > 0 && <ActionCount>{item.likes}</ActionCount>}
        </ActionGroup>
        <ActionBtn onClick={() => doShare(buildShareText(item))}><ShareIcon /></ActionBtn>
      </Actions>
    </Slide>
  );
}
