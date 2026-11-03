'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LineIcon } from '@/components/common/LineIcons';
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
import { useCommentsSheet } from './comments/useCommentsSheet';
import CommentsSheet from './comments/CommentsSheet';
import type { FeedItem, FeedSlide } from '@/types';
import { FeedPrefs, DEFAULT_FEED_PREFS, getFeedPrefs, saveFeedPrefs, isCustomPrefs } from '@/lib/feedPrefs';
import { buildFeedSlides, ensureReelGaps } from '@/lib/feedSlides';
import { bumpStreak, isFirstVisit, StreakInfo } from '@/lib/feedStreak';
import { HE } from '@/lib/hebrewTexts';
import { getDailyProgress, bumpViewed, DAILY_GOAL } from '@/lib/feedDaily';
import FeedSeal from './FeedSeal';
import AddToHomeScreen from '@/components/common/AddToHomeScreen';
import { useFeedDeck } from './useFeedDeck';
import { useFeedExtras } from './useFeedExtras';
import { theme } from '@/lib/theme';
import FeedShareSheet from './FeedShareSheet';
import { Wrapper, Scroll, SwipeHint, Spinner } from './feedViewStyles';
import { FeedLoadingSlide, FeedErrorSlide, FeedEmptySlide } from './FeedStatus';
import { useThemeColor } from '@/components/common/useThemeColor';

const PRELOAD_THRESHOLD = 6;

export default function FeedView() {
  const deck = useFeedDeck();
  const { cards, setCards, fetching, initialLoaded, loadError, fetchMore } = deck;
  const [savedMode, setSavedMode]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reader, setReader]             = useState<ReaderData | null>(null);
  const [prefs, setPrefs]               = useState<FeedPrefs>(DEFAULT_FEED_PREFS);
  const { dedications, reels } = useFeedExtras();
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
  const slidesLenRef = useRef(0);
  const reelGapsRef = useRef<number[]>([]);

  const { reacted, savedIds, savedItems, handleReact, handleBookmark } = useFeedEngagement(setCards);
  const [share, setShare] = useState<{ item: FeedItem; slide: HTMLElement | null } | null>(null);
  const openShare = useCallback((item: FeedItem, slide: HTMLElement | null) => setShare({ item, slide }), []);
  const comments = useCommentsSheet();
  useThemeColor(theme.onMedia.void);

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

    // Preferences first, then continue the persisted deck (or start on the
    // item handed over from a home teaser card).
    const loadedPrefs = getFeedPrefs();
    setPrefs(loadedPrefs);
    deck.start(loadedPrefs);
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
    setPrefs(next);
    setSettingsOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
    deck.restart(next);
  }, [deck]);

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
      {fetching && cards.length > 0 && <Spinner aria-hidden="true" />}
      <FeedBackground />
      <FeedAmbient suppressed={reelsOnScreen > 0} />
      <Scroll ref={scrollRef} onScroll={handleScroll}>
        {cards.length === 0 && (loadError
          ? <FeedErrorSlide onRetry={deck.retry} />
          : initialLoaded && !fetching
            ? <FeedEmptySlide onSettings={() => setSettingsOpen(true)} />
            : <FeedLoadingSlide />)}
        {displaySlides.map((slide, i) => {
          if ('slideType' in slide) {
            if (slide.slideType === 'reel') {
              return (
                <FeedReel
                  key={`reel-${slide.id}`} slide={slide} onVisible={handleReelVisible}
                  commentCount={comments.countFor('reel', slide.reelId, slide.comments)} onComments={comments.open}
                />
              );
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
              commentCount={comments.countFor(item.type, item.id, item.comments)}
              onComments={comments.open}
              onShare={openShare}
            />
          );
        })}
      </Scroll>
      {reader && <FeedReader data={reader} onClose={() => setReader(null)} />}
      <FeedShareSheet item={share?.item ?? null} slide={share?.slide ?? null} onClose={() => setShare(null)} />
      {comments.target && (
        <CommentsSheet
          key={`${comments.target.type}:${comments.target.id}`}
          target={comments.target} onTotal={comments.onTotal} onClose={comments.close}
        />
      )}
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
        <SwipeHint>{HE.FEED_SWIPE_HINT}<LineIcon name="chevronUp" size={20} strokeWidth={2.2} /></SwipeHint>
      )}
      <FeedSplash ready={initialLoaded} streak={streak.days} firstVisit={firstVisit} sealed={sealedToday} />
      <AddToHomeScreen />
    </Wrapper>
  );
}
