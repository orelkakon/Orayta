'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import FeedCard from './FeedCard';
import type { FeedItem } from '@/types';
import { HE } from '@/lib/hebrewTexts';

const Wrapper = styled.div`
  position: fixed; inset: 0; background: #050505; z-index: 900; overflow: hidden;
`;

const Header = styled.div`
  position: absolute; top: 0; left: 0; right: 0; height: 60px; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
`;

const BackBtn = styled(Link)`
  color: white; font-size: 0.9rem; font-weight: 700;
  background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.18); border-radius: 20px;
  padding: 7px 16px; transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.22); }
`;

const Title = styled.div`
  color: white; font-family: var(--font-frank,serif); font-size: 1.1rem; font-weight: 700;
  letter-spacing: 0.01em; text-shadow: 0 1px 6px rgba(0,0,0,0.5);
`;

const Scroll = styled.div`
  height: 100dvh; overflow-y: scroll;
  scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const FullSlide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.5); font-size: 1.1rem;
`;

const LIKED_PREFIX = 'orayta_feed_liked_';

function likeKey(type: string, id: string) { return `${type}:${id}`; }

function loadLikedSet(): Set<string> {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(LIKED_PREFIX)).map(k => k.slice(LIKED_PREFIX.length));
    const s = new Set<string>();
    keys.forEach(k => s.add(k));
    return s;
  } catch { return new Set<string>(); }
}

export default function FeedView() {
  const [cards, setCards] = useState<FeedItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
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
    setLikedSet(loadLikedSet());
    void fetchMore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) void fetchMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchMore]);

  const handleLike = useCallback(async (item: FeedItem) => {
    const key = likeKey(item.type, item.id);
    if (likedSet.has(key)) return;
    try { localStorage.setItem(`${LIKED_PREFIX}${key}`, '1'); } catch {}
    setLikedSet(prev => { const next = new Set(prev); next.add(key); return next; });
    setCards(prev => prev.map(c =>
      c.type === item.type && c.id === item.id ? { ...c, likes: c.likes + 1 } : c
    ));
    await fetch('/api/feed/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: item.type, id: item.id }),
    });
  }, [likedSet]);

  if (!initialLoaded) {
    return (
      <Wrapper>
        <Header>
          <BackBtn href="/">{HE.FEED_BACK}</BackBtn>
          <Title>{HE.FEED_TITLE}</Title>
        </Header>
        <FullSlide>{HE.FEED_LOADING}</FullSlide>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Header>
        <BackBtn href="/">{HE.FEED_BACK}</BackBtn>
        <Title>{HE.FEED_TITLE}</Title>
      </Header>
      <Scroll>
        {cards.map(item => (
          <FeedCard
            key={`${item.type}:${item.id}`}
            item={item}
            isLiked={likedSet.has(likeKey(item.type, item.id))}
            onLike={handleLike}
          />
        ))}
        <FullSlide ref={sentinelRef}>
          {fetching ? HE.FEED_LOADING_MORE : ''}
        </FullSlide>
      </Scroll>
    </Wrapper>
  );
}
