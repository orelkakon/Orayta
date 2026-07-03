'use client';

import styled, { keyframes } from 'styled-components';
import type { FeedItem, Citation, Rabbi, Book, Chidush, Gematria, FeedSikumData } from '@/types';
import { HE } from '@/lib/hebrewTexts';

const TYPE_CONFIG: Record<string, { icon: string; label: string; grad: string }> = {
  citation: { icon: '📜', label: HE.FEED_TYPE_CITATION, grad: 'linear-gradient(160deg,#050a1e 0%,#0d1a52 60%,#1a2a7a 100%)' },
  rabbi:    { icon: '👥', label: HE.FEED_TYPE_RABBI,    grad: 'linear-gradient(160deg,#150800 0%,#3d1e00 60%,#6b3200 100%)' },
  book:     { icon: '📚', label: HE.FEED_TYPE_BOOK,     grad: 'linear-gradient(160deg,#041008 0%,#0a2e14 60%,#114022 100%)' },
  chidush:  { icon: '💡', label: HE.FEED_TYPE_CHIDUSH,  grad: 'linear-gradient(160deg,#120800 0%,#3d1800 60%,#6b2800 100%)' },
  gematria: { icon: '🔢', label: HE.FEED_TYPE_GEMATRIA, grad: 'linear-gradient(160deg,#06021a 0%,#140852 60%,#220d8c 100%)' },
  sikum:    { icon: '📝', label: HE.FEED_TYPE_SIKUM,    grad: 'linear-gradient(160deg,#12041a 0%,#320a40 60%,#4a1060 100%)' },
};

const heartPop = keyframes`0%{transform:scale(1)}40%{transform:scale(1.6)}70%{transform:scale(0.9)}100%{transform:scale(1)}`;

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
  background: rgba(255,255,255,0.13); backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.9); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 5px 12px; border-radius: 20px; display: flex; gap: 6px; align-items: center;
  border: 1px solid rgba(255,255,255,0.15);
`;

const ContentArea = styled.div`
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 72px 72px 100px 16px; gap: 14px;
`;

const MainText = styled.p`
  color: rgba(255,255,255,0.95); font-family: var(--font-frank,serif);
  font-size: 1.3rem; line-height: 1.75; text-align: center;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 7; -webkit-box-orient: vertical;
`;

const BigWord = styled.div`
  color: white; font-family: var(--font-frank,serif);
  font-size: clamp(1.8rem,6vw,2.8rem); font-weight: 800; text-align: center;
`;

const BigNum = styled.div`
  color: rgba(255,255,255,0.9); font-family: var(--font-frank,serif);
  font-size: clamp(3.5rem,12vw,5rem); font-weight: 900; line-height: 1; text-align: center;
`;

const SubText = styled.div`
  color: rgba(255,255,255,0.65); font-size: 0.9rem; text-align: center; line-height: 1.5;
`;

const Actions = styled.div`
  position: absolute; left: 16px; bottom: 90px;
  display: flex; flex-direction: column; gap: 18px; align-items: center;
`;

const ActionBtn = styled.button<{ $liked?: boolean }>`
  width: 54px; height: 54px; border-radius: 50%;
  background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.18);
  color: white; font-size: 1.5rem; line-height: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  transition: transform 0.15s, background 0.15s;
  ${p => p.$liked && `animation: ${heartPop} 0.35s ease; background: rgba(220,50,50,0.35);`}
  &:active { transform: scale(0.92); }
`;

const ActionCount = styled.span`
  font-size: 0.62rem; font-weight: 700; color: rgba(255,255,255,0.8);
`;

const Caption = styled.div`
  position: absolute; bottom: 20px; right: 16px; left: 80px;
  color: rgba(255,255,255,0.6); font-size: 0.8rem; line-height: 1.45;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
`;

function buildShareText(item: FeedItem): string {
  const tag = '\nדרך אורייתא 📖';
  switch (item.type) {
    case 'citation': { const d = item.data as Citation; const loc = d.locations[0]; return `"${d.content.slice(0,220)}"${loc ? ` — ${loc.masechet} דף ${loc.daf}` : ''}${tag}`; }
    case 'rabbi':    { const d = item.data as Rabbi;    return `${d.name} (${d.datePeriod})\n${d.bio.slice(0,220)}${tag}`; }
    case 'book':     { const d = item.data as Book;     return `📚 ${d.title} — ${HE.FEED_BOOK_BY} ${d.author}${tag}`; }
    case 'chidush':  { const d = item.data as Chidush;  const attr = [d.source, d.author].filter(Boolean).join(' · '); return `💡 ${d.text.slice(0,220)}${attr ? `\n— ${attr}` : ''}${tag}`; }
    case 'gematria': { const d = item.data as Gematria; return `🔢 ${d.word} = ${d.value} ${HE.FEED_GEMATRIA_UNIT}${tag}`; }
    case 'sikum':    { const d = item.data as FeedSikumData; return `📝 ${d.bookName}${d.title ? ` — ${d.title}` : ''}\n${d.text.slice(0,220)}${tag}`; }
  }
}

function renderContent(item: FeedItem) {
  switch (item.type) {
    case 'citation': {
      const d = item.data as Citation;
      const loc = d.locations[0];
      const caption = loc ? `${loc.masechet} · דף ${loc.daf}${loc.amud ? ` ${loc.amud}` : ''}` : '';
      return { body: <MainText>{d.content}</MainText>, caption };
    }
    case 'rabbi': {
      const d = item.data as Rabbi;
      return { body: <><BigWord>{d.name}</BigWord><SubText>{d.datePeriod}</SubText><MainText>{d.bio}</MainText></>, caption: d.fullName ?? '' };
    }
    case 'book': {
      const d = item.data as Book;
      return { body: <><BigWord>{d.title}</BigWord><SubText>{HE.FEED_BOOK_BY} {d.author}</SubText></>, caption: '' };
    }
    case 'chidush': {
      const d = item.data as Chidush;
      return { body: <MainText>{d.text}</MainText>, caption: [d.source, d.author].filter(Boolean).join(' · ') };
    }
    case 'gematria': {
      const d = item.data as Gematria;
      return { body: <><BigWord>{d.word}</BigWord><BigNum>{d.value}</BigNum><SubText>{HE.FEED_GEMATRIA_UNIT}</SubText></>, caption: '' };
    }
    case 'sikum': {
      const d = item.data as FeedSikumData;
      return { body: <>{d.title && <BigWord>{d.title}</BigWord>}<MainText>{d.text}</MainText></>, caption: `${d.bookIcon ?? '📝'} ${d.bookName}` };
    }
  }
}

interface Props { item: FeedItem; isLiked: boolean; onLike: (item: FeedItem) => void; }

export default function FeedCard({ item, isLiked, onLike }: Props) {
  const cfg = TYPE_CONFIG[item.type];
  const { body, caption } = renderContent(item);

  const onShare = () => {
    const text = buildShareText(item);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Slide $grad={cfg.grad}>
      <TypeBadge>{cfg.icon} {cfg.label}</TypeBadge>
      <ContentArea>{body}</ContentArea>
      <Actions>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ActionBtn $liked={isLiked} onClick={() => onLike(item)} aria-label={HE.FEED_LIKE}>
            {isLiked ? '❤️' : '🤍'}
          </ActionBtn>
          <ActionCount>{item.likes > 0 ? item.likes : ''}</ActionCount>
        </div>
        <ActionBtn onClick={onShare} aria-label={HE.FEED_SHARE_WA}>📤</ActionBtn>
      </Actions>
      {caption ? <Caption>{caption}</Caption> : null}
    </Slide>
  );
}
