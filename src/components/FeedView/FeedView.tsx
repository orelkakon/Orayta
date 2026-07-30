'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import FeedCard from './FeedCard';
import FeedAmbient from './FeedAmbient';
import FeedBackground from './FeedBackground';
import FeedDedication from './FeedDedication';
import FeedHeader from './FeedHeader';
import FeedSettings from './FeedSettings';
import FeedSplash from './FeedSplash';
import FeedReader, { ReaderData } from './FeedReader';
import FeedReel from './FeedReel';
import SavedPanel from './SavedPanel';
import { useFeedEngagement } from './useFeedEngagement';
import type { FeedItem, FeedSlide, Dedication, InstagramReel } from '@/types';
import { ALL_FEED_TYPES, FeedPrefs, DEFAULT_FEED_PREFS, getFeedPrefs, saveFeedPrefs, isCustomPrefs } from '@/lib/feedPrefs';
import { buildFeedSlides, ensureReelGaps } from '@/lib/feedSlides';
import { bumpStreak } from '@/lib/feedStreak';

const Wrapper = styled.div`position: fixed; inset: 0; background: #050505; z-index: 900; overflow: hidden;`;

const Scroll = styled.div`
  height: 100dvh; overflow-y: scroll; scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;
const Spinner = styled.div`
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.15);
  border-top-color: rgba(255,255,255,0.6); border-radius: 50%;
  animation: ${spin} 0.7s linear infinite; z-index: 300;
`;

const PRELOAD_THRESHOLD = 6;

export default function FeedView() {
  const [cards, setCards]               = useState<FeedItem[]>([]);
  const [fetching, setFetching]         = useState(false);
  const [initialLoaded, setInitial]     = useState(false);
  const [savedMode, setSavedMode]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reader, setReader]             = useState<ReaderData | null>(null);
  const [prefs, setPrefs]               = useState<FeedPrefs>(DEFAULT_FEED_PREFS);
  const [dedications, setDedications]   = useState<Dedication[]>([]);
  const [reels, setReels]               = useState<InstagramReel[]>([]);
  const [reelsOnScreen, setReelsOnScreen] = useState(0);
  const [streak, setStreak]             = useState(0);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const prefsRef    = useRef<FeedPrefs>(DEFAULT_FEED_PREFS);
  const genRef      = useRef(0);
  // Session deck: seed + page let the server deal content without repeats
  // until the full pool is exhausted (see /api/feed and lib/feedShuffle)
  const seedRef     = useRef(Math.floor(Math.random() * 4294967296));
  const pageRef     = useRef(0);
  const slidesLenRef = useRef(0);
  const reelGapsRef = useRef<number[]>([]);

  const { reacted, savedIds, savedItems, handleReact, handleBookmark } = useFeedEngagement(setCards);

  const fetchMore = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setFetching(true);
    const gen = genRef.current;
    try {
      const types = prefsRef.current.types;
      const typesQ = types.length < ALL_FEED_TYPES.length ? `&types=${types.join(',')}` : '';
      const res = await fetch(`/api/feed?seed=${seedRef.current}&page=${pageRef.current}${typesQ}`);
      const items: FeedItem[] = await res.json();
      if (gen === genRef.current) {
        pageRef.current += 1;
        setCards(prev => [...prev, ...items]);
      }
    } finally {
      fetchingRef.current = false;
      setFetching(false);
      setInitial(true);
    }
  }, []);

  useEffect(() => {
    setStreak(bumpStreak());

    // Load feed preferences before the first fetch
    const loadedPrefs = getFeedPrefs();
    prefsRef.current = loadedPrefs;
    setPrefs(loadedPrefs);

    void fetchMore();
    void fetch('/api/dedications').then(r => r.json()).then((d: Dedication[]) => {
      setDedications([...d].sort(() => Math.random() - 0.5));
    });
    void fetch('/api/instagram/reels').then(r => r.json()).then((r: InstagramReel[]) => {
      setReels([...r].sort(() => Math.random() - 0.5));
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displaySlides = useMemo((): FeedSlide[] => {
    ensureReelGaps(reelGapsRef.current, cards.length);
    return buildFeedSlides(cards, dedications, reels, reelGapsRef.current, prefs.dedications, prefs.reels);
  }, [cards, dedications, reels, prefs]);

  slidesLenRef.current = displaySlides.length;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / window.innerHeight);
    if (idx >= slidesLenRef.current - PRELOAD_THRESHOLD) void fetchMore();
  }, [fetchMore]);

  const handleSaveSettings = useCallback((next: FeedPrefs) => {
    saveFeedPrefs(next);
    prefsRef.current = next;
    setPrefs(next);
    setSettingsOpen(false);
    genRef.current += 1;       // discard any in-flight page of the old mix
    fetchingRef.current = false;
    seedRef.current = Math.floor(Math.random() * 4294967296); // new deck
    pageRef.current = 0;
    setCards([]);
    scrollRef.current?.scrollTo({ top: 0 });
    void fetchMore();
  }, [fetchMore]);

  const handleReelVisible = useCallback((visible: boolean) => {
    setReelsOnScreen(c => Math.max(0, c + (visible ? 1 : -1)));
  }, []);

  return (
    <Wrapper>
      <FeedHeader
        streak={streak}
        savedCount={savedItems.length}
        custom={isCustomPrefs(prefs)}
        onSettings={() => setSettingsOpen(true)}
        onSaved={() => setSavedMode(true)}
      />
      {fetching && <Spinner />}
      <FeedBackground />
      <FeedAmbient suppressed={reelsOnScreen > 0} />
      <Scroll ref={scrollRef} onScroll={handleScroll}>
        {displaySlides.map((slide, i) => {
          if ('slideType' in slide) {
            if (slide.slideType === 'reel') {
              return <FeedReel key={`reel-${slide.id}`} slide={slide} onVisible={handleReelVisible} />;
            }
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
        prefs={prefs}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
      <FeedSplash ready={initialLoaded} streak={streak} />
    </Wrapper>
  );
}
