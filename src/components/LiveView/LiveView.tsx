'use client';

import { useCallback, useEffect, useState } from 'react';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import type { LiveChannel, LiveSnapshot, LiveStream } from '@/types';
import LiveCard from './LiveCard';
import LivePlayer from './LivePlayer';
import LiveAdminCard from './LiveAdminCard';
import {
  Page, Hero, HeroTitleRow, LiveDot, HeroTitle, HeroSub, CountChip, Grid,
  EmptyCard, EmptyTitle, EmptySub, SectionTitle, ChannelsRow, ChannelItem,
  ChannelDisc, ChannelName, ChannelLiveTag,
} from './liveStyles';

const POLL_MS = 75_000;

export default function LiveView() {
  const role = useRole();
  const [snapshot, setSnapshot] = useState<LiveSnapshot | null>(null);
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [watching, setWatching] = useState<LiveStream | null>(null);

  const loadLive = useCallback(() => {
    void fetch('/api/live')
      .then(r => r.json())
      .then((d: LiveSnapshot) => { if (Array.isArray(d.streams)) setSnapshot(d); })
      .catch(() => {});
  }, []);

  const loadChannels = useCallback(() => {
    void fetch('/api/live/channels')
      .then(r => r.json())
      .then((d: unknown) => { if (Array.isArray(d)) setChannels(d as LiveChannel[]); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadLive();
    loadChannels();
    const timer = setInterval(loadLive, POLL_MS);
    // Refresh immediately when the user returns to the tab — liveness is
    // exactly the kind of state that goes stale in a background tab.
    const onVisible = () => { if (document.visibilityState === 'visible') loadLive(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadLive, loadChannels]);

  const streams = snapshot?.streams ?? [];
  const liveIds = new Set(streams.map(s => s.channelId));
  const loading = snapshot === null;

  return (
    <Page>
      <Hero>
        <HeroTitleRow>
          <LiveDot $on={streams.length > 0} />
          <HeroTitle>{HE.LIVE_TITLE}</HeroTitle>
        </HeroTitleRow>
        <HeroSub>{HE.LIVE_SUBTITLE}</HeroSub>
        {streams.length > 0 && (
          <CountChip>
            {streams.length === 1 ? HE.LIVE_NOW_SINGLE : HE.LIVE_NOW_COUNT(streams.length)}
          </CountChip>
        )}
      </Hero>

      {streams.length > 0 ? (
        <Grid>
          {streams.map(s => <LiveCard key={s.videoId} stream={s} onWatch={setWatching} />)}
        </Grid>
      ) : !loading && (
        <EmptyCard>
          <span style={{ fontSize: '2rem' }}>📡</span>
          <EmptyTitle>{HE.LIVE_EMPTY_TITLE}</EmptyTitle>
          <EmptySub>{HE.LIVE_EMPTY_SUB}</EmptySub>
        </EmptyCard>
      )}

      {channels.length > 0 && (
        <>
          <SectionTitle>{HE.LIVE_CHANNELS_TITLE}</SectionTitle>
          <ChannelsRow>
            {channels.map(c => (
              <ChannelItem
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                $live={liveIds.has(c.channelId)}
              >
                <ChannelDisc $live={liveIds.has(c.channelId)}>{c.name.trim().charAt(0)}</ChannelDisc>
                <ChannelName>{c.name}</ChannelName>
                {liveIds.has(c.channelId) && <ChannelLiveTag>● {HE.LIVE_BADGE}</ChannelLiveTag>}
              </ChannelItem>
            ))}
          </ChannelsRow>
        </>
      )}

      {role === 'admin' && (
        <div style={{ width: '100%', maxWidth: 560, marginTop: theme.spacing.md }}>
          <LiveAdminCard onChanged={() => { loadChannels(); loadLive(); }} />
        </div>
      )}

      {watching && <LivePlayer stream={watching} onClose={() => setWatching(null)} />}
    </Page>
  );
}
