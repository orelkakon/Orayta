'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import PushOptInCard from '@/components/Notifications/PushOptInCard';
import { useLearnToday } from '@/components/LearnView/useLearnData';
import StoriesRow from './StoriesRow';
import TodayHero from './TodayHero';
import LiveBannerBlock from './LiveBannerBlock';
import FeedTeaser from './FeedTeaser';
import QuickAccess from './QuickAccess';
import HomeLearnCard from './HomeLearnCard';
import HomeNearbyHub from './HomeNearbyHub';
import DedicateCard from './DedicateCard';

/**
 * Home = "today in Orayta". Phones: one calm column in order of daily use —
 * stories, today (date · prayer now), a taste of the feed, quick tools, the
 * day's learning, nearby, dedications. Tablets put the side cards in pairs;
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
        <TodayHero parasha={parasha} />
        <LiveBannerBlock />
        <FeedTeaser />
        <QuickAccess />
      </Column>
      <Side>
        <HomeLearnCard load={load} />
        <HomeNearbyHub />
        <PushOptInCard />
        <DedicateCard />
      </Side>
    </Layout>
  );
}
