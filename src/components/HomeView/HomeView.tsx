'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import PushOptInCard from '@/components/Notifications/PushOptInCard';
import { useLearnToday } from '@/components/LearnView/useLearnData';
import StoriesRow from './StoriesRow';
import TodayHero from './TodayHero';
import LiveBannerBlock from './LiveBannerBlock';
import FeedTeaser from './FeedTeaser';
import QuickAccess from './QuickAccess';
import HomeNearbyHub from './HomeNearbyHub';
import DedicateCard from './DedicateCard';

/**
 * Home = "today in Orayta". Phones: one calm column in order of daily use —
 * stories, today (date · prayer now), a taste of the feed, quick tools,
 * nearby, dedications. Tablets put the side cards in pairs;
 * desktop splits into a main column and a side column under the stories.
 */
const Layout = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr);
  gap: ${theme.spacing.lg};
  ${theme.up.wide} {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
    column-gap: ${theme.spacing.xl}; row-gap: ${theme.spacing.lg};
    align-items: start;
  }
`;

const Full = styled.div`
  min-width: 0;
  ${theme.up.wide} { grid-column: 1 / -1; }
`;

const Column = styled.div`
  min-width: 0; display: flex; flex-direction: column; gap: ${theme.spacing.lg};
`;

const Side = styled(Column)`
  ${theme.up.md} {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start;
  }
  ${theme.up.wide} { display: flex; }
`;

const surface = keyframes`
  from { opacity: 0; transform: translateY(36px) scale(0.97); }
  to { opacity: 1; transform: none; }
`;

/**
 * Cards below the fold rise in as they scroll into view — a CSS scroll-driven
 * animation (no JS, so nothing is hidden before hydration; browsers without
 * it simply show the card). Empty wrappers (a card that renders nothing)
 * collapse so they don't leave a gap.
 */
const Reveal = styled.div`
  min-width: 0;
  &:empty { display: none; }
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      animation: ${surface} linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 80%;
    }
  }
`;

const recede = keyframes`to { opacity: 0.3; transform: translate3d(0, 10%, 0) scale(0.93); }`;

/* The hero sinks back under the header as the page scrolls past it —
   depth instead of a flat slide-away. Same scroll-driven, no-JS approach. */
const HeroDepth = styled.div`
  min-width: 0;
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      animation: ${recede} linear both;
      animation-timeline: view();
      animation-range: exit 0% exit 100%;
    }
  }
`;

const Title = styled.h1`
  position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
`;

export default function HomeView() {
  const { load } = useLearnToday();
  const parasha = load.state === 'ready' ? load.data.parasha : null;

  return (
    <Layout>
      <Title>{HE.APP_NAME}</Title>
      <Full><StoriesRow /></Full>
      <Column>
        <HeroDepth><TodayHero parasha={parasha} /></HeroDepth>
        <LiveBannerBlock />
        <Reveal><FeedTeaser /></Reveal>
        <Reveal><QuickAccess /></Reveal>
      </Column>
      <Side>
        <Reveal><HomeNearbyHub /></Reveal>
        <Reveal><PushOptInCard /></Reveal>
        <Reveal><DedicateCard /></Reveal>
      </Side>
    </Layout>
  );
}
