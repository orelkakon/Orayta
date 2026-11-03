'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { LiveSnapshot, LiveStream } from '@/types';

/**
 * Shown only while a followed channel is live: a slim red strip with the
 * channel's thumbnail. Nothing at all otherwise (live is in the "עוד" sheet).
 */
const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, ${theme.colors.error} 60%, transparent); }
  70%      { box-shadow: 0 0 0 7px transparent; }
`;

const Strip = styled(Link)`
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: 10px 12px; border-radius: 18px;
  color: ${theme.onMedia.ink};
  background: linear-gradient(135deg, color-mix(in srgb, ${theme.colors.error} 82%, ${theme.colors.text}) 0%, ${theme.colors.error} 100%);
  box-shadow: ${theme.shadows.md};
  transition: transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.98); }
`;

const Thumb = styled.span`
  position: relative; flex-shrink: 0; width: 64px; height: 40px; border-radius: 10px; overflow: hidden;
  background: ${theme.onMedia.shade};
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const Dot = styled.span.attrs({ className: 'anim-loop' })`
  flex-shrink: 0; width: 9px; height: 9px; border-radius: 50%;
  background: ${theme.onMedia.ink};
  animation: ${pulse} 1.6s ease-out infinite;
`;

const Texts = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column;`;
const Title = styled.span`display: flex; align-items: center; gap: 7px; font-weight: 800; font-size: ${theme.fontSizes.md};`;
const Name = styled.span`
  font-size: ${theme.fontSizes.xs}; color: ${theme.onMedia.muted};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

export default function LiveBannerBlock() {
  const [streams, setStreams] = useState<LiveStream[]>([]);

  useEffect(() => {
    void fetch('/api/live')
      .then(r => r.json())
      .then((d: LiveSnapshot) => { if (Array.isArray(d.streams)) setStreams(d.streams); })
      .catch(() => {});
  }, []);

  if (streams.length === 0) return null;
  const first = streams[0];

  return (
    <Strip href="/live">
      {first.thumbnail && (
        <Thumb><img src={first.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" /></Thumb>
      )}
      <Texts>
        <Title><Dot aria-hidden="true" />{HE.HOME_LIVE_NOW}</Title>
        <Name>{streams.map(s => s.channelName).join(' · ')}</Name>
      </Texts>
      <LineIcon name="chevron" size={20} strokeWidth={2} />
    </Strip>
  );
}
