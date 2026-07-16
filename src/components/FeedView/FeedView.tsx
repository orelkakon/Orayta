'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import FeedCard from './FeedCard';
import FeedAmbient from './FeedAmbient';
import FeedBackground from './FeedBackground';
import FeedDedication from './FeedDedication';
import FeedSettings from './FeedSettings';
import FeedReader, { ReaderData } from './FeedReader';
import SavedPanel from './SavedPanel';
import type { FeedItem, FeedItemType, FeedReaction, FeedDedicationSlide, Dedication } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { ALL_FEED_TYPES, getFeedPrefs, saveFeedPrefs } from '@/lib/feedPrefs';

const Wrapper = styled.div`position: fixed; inset: 0; background: #050505; z-index: 900; overflow: hidden;`;

const Header = styled.div`
  position: absolute; top: 0; left: 0; right: 0; height: 60px; z-index: 200;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  gap: 8px; padding: 0 12px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
`;

const BackBtn = styled(Link)`
  justify-self: start; white-space: nowrap;
  color: white; font-size: 0.85rem; font-weight: 700;
  background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.18); border-radius: 20px; padding: 7px 14px;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.22); }
`;

const Title = styled.div`
  color: white; font-family: var(--font-frank,serif); font-size: 1.05rem; font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;
`;

const HeaderSide = styled.div`justify-self: end; display: flex; align-items: center; gap: 6px;`;

const BookmarkBtn = styled.button<{ $count: number }>`
  background: ${p => p.$count > 0 ? 'rgba(255,220,80,0.15)' : 'rgba(255,255,255,0.1)'};
  border: 1px solid ${p => p.$count > 0 ? 'rgba(255,220,80,0.4)' : 'rgba(255,255,255,0.18)'};
  backdrop-filter: blur(10px); border-radius: 20px; padding: 7px 13px;
  color: ${p => p.$count > 0 ? 'rgba(255,220,80,0.95)' : 'rgba(255,255,255,0.7)'};
  font-size: 0.85rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
`;

const SettingsBtn = styled.button<{ $custom: boolean }>`
  background: ${p => p.$custom ? 'rgba(160,130,255,0.18)' : 'rgba(255,255,255,0.1)'};
  border: 1px solid ${p => p.$custom ? 'rgba(160,130,255,0.45)' : 'rgba(255,255,255,0.18)'};
  backdrop-filter: blur(10px); border-radius: 50%;
  width: 34px; height: 34px; font-size: 0.95rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, border-color 0.2s;
  &:hover { background: rgba(255,255,255,0.2); }
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reader, setReader]             = useState<ReaderData | null>(null);
  const [prefs, setPrefs]               = useState<FeedItemType[]>(ALL_FEED_TYPES);
  const [dedications, setDedications]   = useState<Dedication[]>([]);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const prefsRef    = useRef<FeedItemType[]>(ALL_FEED_TYPES);
  const genRef      = useRef(0);
  const slidesLenRef = useRef(0);
  const swipeStartX = useRef<number | null>(null);

  const fetchMore = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setFetching(true);
    const gen = genRef.current;
    try {
      const types = prefsRef.current;
      const query = types.length < ALL_FEED_TYPES.length ? `?types=${types.join(',')}` : '';
      const res = await fetch(`/api/feed${query}`);
      const items: FeedItem[] = await res.json();
      if (gen === genRef.current) setCards(prev => [...prev, ...items]);
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

    // Load feed preferences before the first fetch
    const loadedPrefs = getFeedPrefs();
    prefsRef.current = loadedPrefs;
    setPrefs(loadedPrefs);

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

  const handleSaveSettings = useCallback((types: FeedItemType[]) => {
    saveFeedPrefs(types);
    prefsRef.current = types;
    setPrefs(types);
    setSettingsOpen(false);
    genRef.current += 1;       // discard any in-flight page of the old mix
    fetchingRef.current = false;
    setCards([]);
    scrollRef.current?.scrollTo({ top: 0 });
    void fetchMore();
  }, [fetchMore]);

  const handleReact = useCallback(async (item: FeedItem, reaction: FeedReaction) => {
    const key = `${item.type}:${item.id}`;
    const isOn = Boolean(reacted[key]?.[reaction]);
    if (isOn) {
      // un-react: remove locally only
      try { localStorage.removeItem(`${REACTED_PREFIX}${reaction}_${key}`); } catch {}
      setReacted(prev => {
        const copy = { ...prev[key] };
        delete copy[reaction];
        return { ...prev, [key]: copy };
      });
      setCards(prev => prev.map(c => c.type === item.type && c.id === item.id
        ? { ...c, reactions: { ...c.reactions, [reaction]: Math.max(0, c.reactions[reaction] - 1) } }
        : c
      ));
    } else {
      try { localStorage.setItem(`${REACTED_PREFIX}${reaction}_${key}`, '1'); } catch {}
      setReacted(prev => ({ ...prev, [key]: { ...prev[key], [reaction]: true } }));
      setCards(prev => prev.map(c => c.type === item.type && c.id === item.id
        ? { ...c, reactions: { ...c.reactions, [reaction]: c.reactions[reaction] + 1 } }
        : c
      ));
      try {
        await fetch('/api/feed/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: item.type, id: item.id, reaction }) });
      } catch {}
    }
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
        void fetch('/api/feed/save', { method: 'POST' }).catch(() => {});
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
        <HeaderSide>
          <SettingsBtn
            $custom={prefs.length < ALL_FEED_TYPES.length}
            onClick={() => setSettingsOpen(true)}
            aria-label={HE.FEED_SETTINGS_OPEN}
          >
            ⚙️
          </SettingsBtn>
          <BookmarkBtn $count={savedItems.length} onClick={() => setSavedMode(true)}>
            🔖{savedItems.length > 0 && ` ${savedItems.length}`}
          </BookmarkBtn>
        </HeaderSide>
      </Header>
      {fetching && <Spinner />}
      <FeedBackground />
      <FeedAmbient />
      <Scroll ref={scrollRef} onScroll={handleScroll} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {displaySlides.map((slide, i) => {
          if ('slideType' in slide) {
            return <FeedDedication key={`ded-${slide.id}-${i}`} slide={slide} />;
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
              onExpand={setReader}
            />
          );
        })}
      </Scroll>
      {reader && <FeedReader data={reader} onClose={() => setReader(null)} />}
      <SavedPanel
        open={savedMode}
        items={savedItems}
        reacted={reacted}
        onClose={() => setSavedMode(false)}
        onRemove={handleBookmark}
      />
      <FeedSettings
        open={settingsOpen}
        selected={prefs}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </Wrapper>
  );
}
