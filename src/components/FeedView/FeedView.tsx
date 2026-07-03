'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import FeedCard from './FeedCard';
import type { FeedItem, FeedDedicationSlide, Dedication } from '@/types';
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

const Scroll = styled.div`
  height: 100dvh; overflow-y: scroll; scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Sentinel = styled.div`
  height: 60px; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.4); font-size: 0.88rem;
`;

const DedSlide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: linear-gradient(160deg, #080610 0%, #10081a 50%, #080610 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 40px 32px; text-align: center;
  border-top: 1px solid rgba(200,170,100,0.08);
`;

const DedIcon = styled.div`font-size: 2.4rem; margin-bottom: 6px;`;
const DedType = styled.div`color: rgba(200,170,100,0.65); font-size: 0.85rem; letter-spacing: 0.06em;`;
const DedName = styled.div`
  color: rgba(255,255,255,0.92); font-family: var(--font-frank,serif);
  font-size: 1.6rem; font-weight: 700; line-height: 1.4;
`;

const DED_LABELS: Record<string, string> = {
  iluy: 'לעילוי נשמת', refua: 'לרפואת', hatzlaha: 'להצלחת', zivug: 'לזיווג',
};

const LIKED_PREFIX = 'orayta_feed_liked_';

export default function FeedView() {
  const [cards, setCards] = useState<FeedItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [liked, setLiked] = useState<Record<string, true>>({});
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

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
      setInitialLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      const initial: Record<string, true> = {};
      Object.keys(localStorage).filter(k => k.startsWith(LIKED_PREFIX)).forEach(k => {
        initial[k.slice(LIKED_PREFIX.length)] = true;
      });
      setLiked(initial);
    } catch {}
    void fetchMore();
    void fetch('/api/dedications').then(r => r.json()).then((d: Dedication[]) => {
      const shuffled = [...d].sort(() => Math.random() - 0.5);
      setDedications(shuffled);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) void fetchMore(); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchMore]);

  const handleLike = useCallback(async (item: FeedItem) => {
    const key = `${item.type}:${item.id}`;
    if (liked[key]) return;
    try { localStorage.setItem(`${LIKED_PREFIX}${key}`, '1'); } catch {}
    setLiked(prev => ({ ...prev, [key]: true }));
    setCards(prev => prev.map(c => c.type === item.type && c.id === item.id ? { ...c, likes: c.likes + 1 } : c));
    try {
      await fetch('/api/feed/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: item.type, id: item.id }) });
    } catch {}
  }, [liked]);

  const displaySlides = useMemo((): Array<FeedItem | FeedDedicationSlide> => {
    if (dedications.length === 0) return cards;
    const result: Array<FeedItem | FeedDedicationSlide> = [];
    cards.forEach((card, i) => {
      result.push(card);
      if ((i + 1) % 5 === 0) {
        const ded = dedications[Math.floor((i + 1) / 5 - 1) % dedications.length];
        result.push({ slideType: 'dedication', id: ded.id, dedType: ded.type, name: ded.name });
      }
    });
    return result;
  }, [cards, dedications]);

  if (!initialLoaded) {
    return (
      <Wrapper>
        <Header><BackBtn href="/">{HE.FEED_BACK}</BackBtn><Title>{HE.FEED_TITLE}</Title></Header>
        <Sentinel>{HE.FEED_LOADING}</Sentinel>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header><BackBtn href="/">{HE.FEED_BACK}</BackBtn><Title>{HE.FEED_TITLE}</Title></Header>
      <Scroll>
        {displaySlides.map((slide, i) => {
          if ('slideType' in slide) {
            const d = slide as FeedDedicationSlide;
            return (
              <DedSlide key={`ded-${d.id}-${i}`}>
                <DedIcon>{d.dedType === 'iluy' ? '🕯️' : '🙏'}</DedIcon>
                <DedType>{DED_LABELS[d.dedType] ?? d.dedType}</DedType>
                <DedName>{d.name}</DedName>
              </DedSlide>
            );
          }
          const item = slide as FeedItem;
          return <FeedCard key={`${item.type}:${item.id}`} item={item} isLiked={Boolean(liked[`${item.type}:${item.id}`])} onLike={handleLike} />;
        })}
        <Sentinel ref={sentinelRef}>{fetching ? HE.FEED_LOADING_MORE : ''}</Sentinel>
      </Scroll>
    </Wrapper>
  );
}
