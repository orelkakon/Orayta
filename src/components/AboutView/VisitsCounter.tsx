'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
`;

const Card = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.xl}; padding: ${theme.spacing.xl} ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md}; width: 100%; max-width: 560px;
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.lg}; text-align: center; position: relative; overflow: hidden;
  &::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.secondary}12);
    pointer-events: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1rem; font-weight: 600; color: ${theme.colors.textMuted};
  width: 100%; border-bottom: 2px solid ${theme.colors.borderLight};
  padding-bottom: ${theme.spacing.sm};
`;

const StatsRow = styled.div`
  display: flex; gap: 0; align-items: stretch;
  justify-content: center; width: 100%;
`;

const StatBlock = styled.div`
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0 8px;
`;
const Emoji = styled.div`font-size: 1.6rem; line-height: 1;`;
const CountNum = styled.div`
  font-family: ${theme.fonts.body}; font-size: 2.1rem; font-weight: 900; line-height: 1;
  color: ${theme.colors.primary}; letter-spacing: -0.02em;
  animation: ${pulse} 2s ease-in-out infinite;
`;
const CountLabel = styled.div`font-size: 0.78rem; font-weight: 600; color: ${theme.colors.text};`;
const CountSub = styled.div`font-size: 0.66rem; color: ${theme.colors.textMuted};`;
const Divider = styled.div`
  width: 1px; background: ${theme.colors.borderLight}; align-self: stretch; flex-shrink: 0;
`;

const ContentRow = styled.div`
  display: flex; align-items: center; justify-content: center;
  gap: 0; width: 100%; overflow-x: auto; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const ContentChip = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 0 10px; flex-shrink: 0;
  &:not(:last-child) {
    border-left: 1px solid ${theme.colors.borderLight};
  }
`;

const ChipEmoji = styled.div`font-size: 1rem; line-height: 1.4; padding-top: 2px;`;
const ChipNum = styled.div`
  font-family: ${theme.fonts.body}; font-size: 1rem; font-weight: 800;
  color: ${theme.colors.primary}; line-height: 1;
`;
const ChipLabel = styled.div`font-size: 0.62rem; color: ${theme.colors.textLight}; white-space: nowrap;`;

function useAnimatedCount(target: number | null): number {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (target === null) return;
    const steps = 60; const duration = 1800; let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setDisplayed(Math.floor(eased * target));
      if (step >= steps) { setDisplayed(target); clearInterval(timer); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return displayed;
}

interface ContentStats { citations: number; rabbis: number; books: number; summaries: number; gematrias: number; chidushim: number; }
interface ReactionsData { total: number; heart: number; fire: number; spark: number; }

export default function VisitsCounter() {
  const [visits, setVisits]         = useState<number | null>(null);
  const [questions, setQuestions]   = useState<number | null>(null);
  const [content, setContent]       = useState<ContentStats | null>(null);
  const [reactions, setReactions]   = useState<ReactionsData | null>(null);
  const [saves, setSaves]           = useState<number | null>(null);
  const [shares, setShares]         = useState<{ wa: number; story: number } | null>(null);

  useEffect(() => {
    void fetch('/api/visits').then(r => r.json()).then((d: { count: number }) => setVisits(d.count));
    void fetch('/api/quiz/answered').then(r => r.json()).then((d: { count: number }) => setQuestions(d.count));
    void fetch('/api/stats').then(r => r.json()).then(setContent as (v: unknown) => void);
    void fetch('/api/feed/like').then(r => r.json()).then((d: ReactionsData) => setReactions(d));
    void fetch('/api/feed/save').then(r => r.json()).then((d: { count: number }) => setSaves(d.count));
    void fetch('/api/shares').then(r => r.json()).then((d: { wa: number; story: number }) => setShares(d));
  }, []);

  const displayedVisits    = useAnimatedCount(visits);
  const displayedQuestions = useAnimatedCount(questions);
  const displayedTotal     = useAnimatedCount(reactions?.total ?? null);
  const displayedHeart     = useAnimatedCount(reactions?.heart ?? null);
  const displayedFire      = useAnimatedCount(reactions?.fire ?? null);
  const displayedSpark     = useAnimatedCount(reactions?.spark ?? null);
  const displayedSaves     = useAnimatedCount(saves);
  const displayedShares    = useAnimatedCount(shares?.wa ?? null);
  const displayedStories   = useAnimatedCount(shares?.story ?? null);

  const chips = content ? [
    { emoji: '📜', num: content.citations,  label: 'ציטוטים' },
    { emoji: '👥', num: content.rabbis,     label: 'רבנים' },
    { emoji: '📖', num: content.books,      label: 'ספרים' },
    { emoji: '📝', num: content.summaries,  label: 'סיכומים' },
    { emoji: '🔢', num: content.gematrias,  label: 'גימטריות' },
    { emoji: '💡', num: content.chidushim,  label: 'חידושים' },
  ] : null;

  return (
    <Card>
      <SectionTitle>נתוני שימוש</SectionTitle>
      <StatsRow>
        <StatBlock>
          <Emoji>🌍</Emoji>
          <CountNum>{visits === null ? '...' : displayedVisits.toLocaleString('he-IL')}</CountNum>
          <CountLabel>ביקורים ייחודיים</CountLabel>
          <CountSub>ממשתמשים שונים</CountSub>
        </StatBlock>
        <Divider />
        <StatBlock>
          <Emoji>🎯</Emoji>
          <CountNum>{questions === null ? '...' : displayedQuestions.toLocaleString('he-IL')}</CountNum>
          <CountLabel>שאלות נענו</CountLabel>
          <CountSub>מכל המשתמשים</CountSub>
        </StatBlock>
        <Divider />
        <StatBlock>
          <Emoji>🎭</Emoji>
          <CountNum>{reactions === null ? '...' : displayedTotal.toLocaleString('he-IL')}</CountNum>
          <CountLabel>{HE.ABOUT_FEED_LIKES}</CountLabel>
          <CountSub>{HE.FEED_TOTAL_LIKES_SUB}</CountSub>
        </StatBlock>
      </StatsRow>

      {reactions && (
        <ContentRow style={{ marginTop: -4 }}>
          {[
            { emoji: '❤️', num: displayedHeart, label: HE.ABOUT_REACTIONS_HEART },
            { emoji: '🔥', num: displayedFire,  label: HE.ABOUT_REACTIONS_FIRE },
            { emoji: '✨', num: displayedSpark,  label: HE.ABOUT_REACTIONS_SPARK },
            { emoji: '🔖', num: displayedSaves,  label: HE.ABOUT_FEED_SAVES },
            { emoji: '💬', num: displayedShares, label: HE.ABOUT_FEED_SHARES },
            { emoji: '📸', num: displayedStories, label: HE.ABOUT_STORY_SHARES },
          ].map(c => (
            <ContentChip key={c.label}>
              <ChipEmoji>{c.emoji}</ChipEmoji>
              <ChipNum>{c.num}</ChipNum>
              <ChipLabel>{c.label}</ChipLabel>
            </ContentChip>
          ))}
        </ContentRow>
      )}

      {chips && (
        <>
          <SectionTitle>{HE.STATS_CONTENT_TITLE}</SectionTitle>
          <ContentRow>
            {chips.map(c => (
              <ContentChip key={c.label}>
                <ChipEmoji>{c.emoji}</ChipEmoji>
                <ChipNum>{c.num}</ChipNum>
                <ChipLabel>{c.label}</ChipLabel>
              </ContentChip>
            ))}
          </ContentRow>
        </>
      )}
    </Card>
  );
}
