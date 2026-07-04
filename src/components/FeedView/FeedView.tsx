'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Link from 'next/link';
import FeedCard from './FeedCard';
import FeedAmbient from './FeedAmbient';
import FeedBackground from './FeedBackground';
import SavedPanel from './SavedPanel';
import type { FeedItem, FeedReaction, FeedDedicationSlide, Dedication } from '@/types';
import { HE } from '@/lib/hebrewTexts';

const Wrapper = styled.div`position: fixed; inset: 0; background: #050505; z-index: 900; overflow: hidden;`;

const Header = styled.div`
  position: absolute; top: 0; left: 0; right: 0; height: 60px; z-index: 200;
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
`;

const BackBtn = styled(Link)`
  color: white; font-size: 0.88rem; font-weight: 700;
  background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.18); border-radius: 20px; padding: 7px 16px;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.22); }
`;

const Title = styled.div`color: white; font-family: var(--font-frank,serif); font-size: 1.05rem; font-weight: 700;`;

const BookmarkBtn = styled.button<{ $count: number }>`
  background: ${p => p.$count > 0 ? 'rgba(255,220,80,0.15)' : 'rgba(255,255,255,0.1)'};
  border: 1px solid ${p => p.$count > 0 ? 'rgba(255,220,80,0.4)' : 'rgba(255,255,255,0.18)'};
  backdrop-filter: blur(10px); border-radius: 20px; padding: 7px 13px;
  color: ${p => p.$count > 0 ? 'rgba(255,220,80,0.95)' : 'rgba(255,255,255,0.7)'};
  font-size: 0.85rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
`;

const Scroll = styled.div`
  height: 100dvh; overflow-y: scroll; scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const LoadingSlide = styled.div`
  height: 100dvh; scroll-snap-align: start;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.4); font-size: 0.95rem;
`;

const spin = keyframes`to { transform: rotate(360deg); }`;
const Spinner = styled.div`
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.15);
  border-top-color: rgba(255,255,255,0.6); border-radius: 50%;
  animation: ${spin} 0.7s linear infinite; z-index: 300;
`;

// Dedication slide with flickering candle
const DedSlide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: linear-gradient(160deg, #080610 0%, #10081a 50%, #080610 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 40px 32px; text-align: center;
  border-top: 1px solid rgba(200,170,100,0.08);
`;

const flicker = keyframes`
  0%,100% { transform: scaleX(1) scaleY(1); opacity: 0.92; }
  20%      { transform: scaleX(0.88) scaleY(1.06); opacity: 1; }
  45%      { transform: scaleX(1.1) scaleY(0.95); opacity: 0.85; }
  70%      { transform: scaleX(0.93) scaleY(1.09); opacity: 0.95; }
`;

const CandleWrap = styled.div`position: relative; width: 28px; height: 46px; margin: 0 auto;`;
const Flame = styled.div`
  position: absolute; bottom: 12px; left: 0; right: 0; margin: auto;
  width: 18px; height: 28px;
  background: radial-gradient(ellipse at 50% 80%, #fff8a0 0%, #ffbe00 38%, #ff6200 68%, transparent 100%);
  border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%;
  animation: ${flicker} 0.55s ease-in-out infinite;
  box-shadow: 0 0 14px 5px rgba(255,140,0,0.45), 0 0 36px 10px rgba(255,90,0,0.12);
`;
const Wick = styled.div`
  position: absolute; bottom: 10px; left: 0; right: 0; margin: auto;
  width: 2px; height: 8px; background: #3a2000; border-radius: 1px; z-index: 1;
`;
const CandleBase = styled.div`
  position: absolute; bottom: 0; left: 0; right: 0; margin: auto;
  width: 16px; height: 12px;
  background: linear-gradient(to bottom, rgba(255,220,150,0.18), rgba(255,200,120,0.08));
  border-radius: 3px;
`;

const glowPulse = keyframes`0%,100%{opacity:0.55} 50%{opacity:0.9}`;
const CandleGlow = styled.div`
  position: absolute; bottom: 8px; left: 0; right: 0; margin: auto;
  width: 60px; height: 60px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,160,0,0.18) 0%, transparent 70%);
  animation: ${glowPulse} 1.1s ease-in-out infinite;
  pointer-events: none;
`;

const DedType = styled.div`color: rgba(200,170,100,0.65); font-size: 0.85rem; letter-spacing: 0.06em;`;
const DedName = styled.div`
  color: rgba(255,255,255,0.92); font-family: var(--font-frank,serif);
  font-size: 1.6rem; font-weight: 700; line-height: 1.4;
`;

const DED_LABELS: Record<string, string> = {
  iluy: 'לעילוי נשמת', refua: 'לרפואת', hatzlaha: 'להצלחת', zivug: 'לזיווג',
};

const REACTED_PREFIX = 'orayta_feed_reacted_';
const SAVED_PREFIX   = 'orayta_feed_saved_';
const PRELOAD_THRESHOLD = 6;

function loadSavedItems(): FeedItem[] {
  try {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(SAVED_PREFIX))
      .flatMap(k => { try { return [JSON.parse(localStorage.getItem(k)!) as FeedItem]; } catch { return []; } });
  } catch { return []; }
}

export default function FeedView() {
  const [cards, setCards]               = useState<FeedItem[]>([]);
  const [fetching, setFetching]         = useState(false);
  const [initialLoaded, setInitial]     = useState(false);
  const [reacted, setReacted]           = useState<Record<string, Partial<Record<FeedReaction, true>>>>({});
  const [savedIds, setSavedIds]         = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems]     = useState<FeedItem[]>([]);
  const [savedMode, setSavedMode]       = useState(false);
  const [dedications, setDedications]   = useState<Dedication[]>([]);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const slidesLenRef = useRef(0);
  const swipeStartX = useRef<number | null>(null);

  const fetchMore = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setFetching(true);
    try {
      const res = await fetch('/api/feed');
      const items: FeedItem[] = await res.json();
      setCards(prev => [...prev, ...items]);
    } finally {
      fetchingRef.current = false;
      setFetching(false);
      setInitial(true);
    }
  }, []);

  useEffect(() => {
    // Migrate old liked keys to new reaction keys
    try {
      Object.keys(localStorage).filter(k => k.startsWith('orayta_feed_liked_')).forEach(k => {
        const nk = k.replace('orayta_feed_liked_', `${REACTED_PREFIX}heart_`);
        localStorage.setItem(nk, '1');
        localStorage.removeItem(k);
      });
    } catch {}

    // Load reactions
    try {
      const initial: Record<string, Partial<Record<FeedReaction, true>>> = {};
      Object.keys(localStorage).filter(k => k.startsWith(REACTED_PREFIX)).forEach(k => {
        const rest = k.slice(REACTED_PREFIX.length);
        const [reaction, ...itemParts] = rest.split('_');
        const itemKey = itemParts.join('_');
        if (!initial[itemKey]) initial[itemKey] = {};
        initial[itemKey][reaction as FeedReaction] = true;
      });
      setReacted(initial);
    } catch {}

    // Load saved
    const saved = loadSavedItems();
    setSavedItems(saved);
    setSavedIds(new Set(saved.map(i => `${i.type}:${i.id}`)));

    void fetchMore();
    void fetch('/api/dedications').then(r => r.json()).then((d: Dedication[]) => {
      setDedications([...d].sort(() => Math.random() - 0.5));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displaySlides = useMemo((): Array<FeedItem | FeedDedicationSlide> => {
    if (dedications.length === 0) return cards;
    const result: Array<FeedItem | FeedDedicationSlide> = [];
    cards.forEach((card, i) => {
      result.push(card);
      if ((i + 1) % 8 === 0) {
        const ded = dedications[Math.floor((i + 1) / 8 - 1) % dedications.length];
        result.push({ slideType: 'dedication', id: ded.id, dedType: ded.type, name: ded.name });
      }
    });
    return result;
  }, [cards, dedications]);

  slidesLenRef.current = displaySlides.length;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / window.innerHeight);
    if (idx >= slidesLenRef.current - PRELOAD_THRESHOLD) void fetchMore();
  }, [fetchMore]);

  const handleReact = useCallback(async (item: FeedItem, reaction: FeedReaction) => {
    const key = `${item.type}:${item.id}`;
    if (reacted[key]?.[reaction]) return;
    try { localStorage.setItem(`${REACTED_PREFIX}${reaction}_${key}`, '1'); } catch {}
    setReacted(prev => ({ ...prev, [key]: { ...prev[key], [reaction]: true } }));
    setCards(prev => prev.map(c => c.type === item.type && c.id === item.id
      ? { ...c, reactions: { ...c.reactions, [reaction]: c.reactions[reaction] + 1 } }
      : c
    ));
    try {
      await fetch('/api/feed/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: item.type, id: item.id, reaction }) });
    } catch {}
  }, [reacted]);

  const handleBookmark = useCallback((item: FeedItem) => {
    const key = `${item.type}:${item.id}`;
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        try { localStorage.removeItem(`${SAVED_PREFIX}${key}`); } catch {}
        setSavedItems(prev2 => prev2.filter(i => `${i.type}:${i.id}` !== key));
      } else {
        next.add(key);
        try { localStorage.setItem(`${SAVED_PREFIX}${key}`, JSON.stringify(item)); } catch {}
        setSavedItems(prev2 => [...prev2, item]);
      }
      return next;
    });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (dx > 65) setSavedMode(true);
  }, []);

  if (!initialLoaded) {
    return (
      <Wrapper>
        <Header><BackBtn href="/">{HE.FEED_BACK}</BackBtn><Title>{HE.FEED_TITLE}</Title></Header>
        <LoadingSlide>{HE.FEED_LOADING}</LoadingSlide>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header>
        <BackBtn href="/">{HE.FEED_BACK}</BackBtn>
        <Title>{HE.FEED_TITLE}</Title>
        <BookmarkBtn $count={savedItems.length} onClick={() => setSavedMode(true)}>
          🔖{savedItems.length > 0 && ` ${savedItems.length}`}
        </BookmarkBtn>
      </Header>
      {fetching && <Spinner />}
      <FeedBackground />
      <FeedAmbient />
      <Scroll ref={scrollRef} onScroll={handleScroll} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {displaySlides.map((slide, i) => {
          if ('slideType' in slide) {
            const d = slide as FeedDedicationSlide;
            const isIluy = d.dedType === 'iluy';
            return (
              <DedSlide key={`ded-${d.id}-${i}`}>
                {isIluy ? (
                  <CandleWrap>
                    <CandleGlow />
                    <Flame />
                    <Wick />
                    <CandleBase />
                  </CandleWrap>
                ) : (
                  <div style={{ fontSize: '2.4rem', marginBottom: 6 }}>🙏</div>
                )}
                <DedType>{DED_LABELS[d.dedType] ?? d.dedType}</DedType>
                <DedName>{d.name}</DedName>
              </DedSlide>
            );
          }
          const item = slide as FeedItem;
          const key = `${item.type}:${item.id}`;
          return (
            <FeedCard
              key={key}
              item={item}
              reacted={reacted[key] ?? {}}
              isSaved={savedIds.has(key)}
              onReact={handleReact}
              onBookmark={handleBookmark}
            />
          );
        })}
      </Scroll>
      <SavedPanel
        open={savedMode}
        items={savedItems}
        reacted={reacted}
        onClose={() => setSavedMode(false)}
        onRemove={handleBookmark}
      />
    </Wrapper>
  );
}
