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
import { shuffleArray } from '@/lib/feedShuffle';
import { buildFeedSlides, ensureReelGaps } from '@/lib/feedSlides';
import { bumpStreak, isFirstVisit, StreakInfo } from '@/lib/feedStreak';
import { HE } from '@/lib/hebrewTexts';
import { getDailyProgress, bumpViewed, DAILY_GOAL } from '@/lib/feedDaily';
import FeedSeal from './FeedSeal';
import AddToHomeScreen from '@/components/common/AddToHomeScreen';

const Wrapper = styled.div`position: fixed; inset: 0; background: #050505; z-index: 900; overflow: hidden;`;

const Scroll = styled.div`
  height: 100dvh; overflow-y: scroll; scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const hintBob = keyframes`
  0%, 100% { transform: translate(-50%, 0); opacity: 0.85; }
  50%      { transform: translate(-50%, -9px); opacity: 1; }
`;

/* First-visit only: one quiet gesture cue, gone forever after the first swipe. */
const SwipeHint = styled.div`
  position: fixed; bottom: calc(30px + env(safe-area-inset-bottom)); left: 50%;
  transform: translateX(-50%);
  z-index: 250; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  color: rgba(255, 250, 235, 0.85); font-size: 0.8rem; font-weight: 600;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
  animation: ${hintBob} 1.6s ease-in-out infinite;
  span { font-size: 1.1rem; line-height: 1; }
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
  const [streak, setStreak]             = useState<StreakInfo>({ days: 0, best: 0 });
  const [viewedToday, setViewedToday]   = useState(0);
  const [firstVisit, setFirstVisit]     = useState(false);
  const [sealedToday, setSealedToday]   = useState(false);
  const [hintDone, setHintDone]         = useState(false);
  const scrollRef   = useRef<HTMLDivElement>(null);
  // Where the daily seal slides in (null = already sealed today). Fixed at
  // mount so the slide doesn't jump around as the user scrolls.
  const sealAfterRef = useRef<number | null>(null);
  const maxIdxRef    = useRef(0);
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
    setFirstVisit(isFirstVisit());
    setStreak(bumpStreak());

    // Today's arc: a few warm-up slides, then the seal — unless today is
    // already sealed, in which case the feed scrolls free.
    const daily = getDailyProgress();
    setViewedToday(daily.viewed);
    setSealedToday(daily.sealed);
    sealAfterRef.current = daily.sealed
      ? null
      : Math.max(2, DAILY_GOAL - daily.viewed);

    // Load feed preferences before the first fetch
    const loadedPrefs = getFeedPrefs();
    prefsRef.current = loadedPrefs;
    setPrefs(loadedPrefs);

    void fetchMore();
    void fetch('/api/dedications').then(r => r.json()).then((d: Dedication[]) => {
      setDedications(shuffleArray(d));
    });
    void fetch('/api/instagram/reels').then(r => r.json()).then((r: InstagramReel[]) => {
      setReels(shuffleArray(r));
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displaySlides = useMemo((): FeedSlide[] => {
    ensureReelGaps(reelGapsRef.current, cards.length);
    return buildFeedSlides(
      cards, dedications, reels, reelGapsRef.current,
      prefs.dedications, prefs.reels, sealAfterRef.current,
    );
  }, [cards, dedications, reels, prefs]);

  slidesLenRef.current = displaySlides.length;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / window.innerHeight);
    // Each newly-reached slide counts toward today's learning.
    if (idx > maxIdxRef.current) {
      maxIdxRef.current = idx;
      setHintDone(true);
      setViewedToday(bumpViewed().viewed);
    }
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
        streak={streak.days}
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
            if (slide.slideType === 'seal') {
              return <FeedSeal key="seal" days={streak.days} best={streak.best} viewed={viewedToday} />;
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
      {firstVisit && !hintDone && initialLoaded && (
        <SwipeHint>{HE.FEED_SWIPE_HINT}<span>⌃</span></SwipeHint>
      )}
      <FeedSplash ready={initialLoaded} streak={streak.days} firstVisit={firstVisit} sealed={sealedToday} />
      <AddToHomeScreen />
    </Wrapper>
  );
}
