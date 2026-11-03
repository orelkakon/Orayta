'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import Sheet from '@/components/ui/Sheet';
import { feedShareText, shareElementImage, shareText } from '@/lib/feedShare';
import { shareStory, feedStory } from '@/lib/storyShare';
import { haptics } from '@/lib/haptics';
import type { FeedItem } from '@/types';

/** One share sheet for every export of a feed card (send, copy, story image, screenshot). */
const List = styled.ul`list-style: none; display: flex; flex-direction: column; gap: 4px;`;

const Row = styled.button`
  width: 100%; min-height: 64px;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: 8px; border-radius: 16px; text-align: start;
  transition: background-color 0.15s ease, transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.98); background: ${theme.colors.surfaceAlt}; }
  @media (hover: hover) and (pointer: fine) { &:hover { background: ${theme.colors.surfaceAlt}; } }
  &:disabled { opacity: 0.6; }
`;

const Disc = styled.span<{ $tone: string }>`
  width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.onMedia.ink}; background: ${p => p.$tone};
`;

const Texts = styled.span`display: flex; flex-direction: column; gap: 1px;`;
const Title = styled.span`font-weight: 700; color: ${theme.colors.text};`;
const Sub = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;

interface Props {
  item: FeedItem | null;
  slide: HTMLElement | null;
  onClose: () => void;
}

export default function FeedShareSheet({ item, slide, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void> | void) => {
    haptics.tap();
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  const options = item ? [
    { icon: 'send', tone: theme.colors.primary, title: HE.FEED_SHARE_SEND, sub: HE.FEED_SHARE_SEND_SUB,
      act: () => { shareText(feedShareText(item)); onClose(); } },
    { icon: copied ? 'check' : 'copy', tone: theme.colors.success, title: copied ? HE.FEED_SHARE_COPIED : HE.FEED_SHARE_COPY, sub: HE.FEED_SHARE_COPY_SUB,
      act: async () => {
        await navigator.clipboard?.writeText(feedShareText(item)).catch(() => {});
        setCopied(true);
        window.setTimeout(() => { setCopied(false); onClose(); }, 900);
      } },
    { icon: 'camera', tone: theme.brand.instagram, title: HE.FEED_SHARE_STORY, sub: HE.FEED_SHARE_STORY_SUB,
      act: async () => { await shareStory(feedStory(item)); onClose(); } },
    { icon: 'download', tone: theme.colors.secondaryText, title: HE.FEED_SHARE_IMAGE, sub: HE.FEED_SHARE_IMAGE_SUB,
      act: async () => { onClose(); if (slide) await shareElementImage(slide); } },
  ] : [];

  return (
    <Sheet open={item !== null} onClose={onClose} title={HE.FEED_SHARE_TITLE} maxWidth={440}>
      <List>
        {options.map(o => (
          <li key={o.title}>
            <Row type="button" disabled={busy} onClick={() => run(o.act)}>
              <Disc $tone={o.tone} aria-hidden="true"><LineIcon name={o.icon} size={22} strokeWidth={1.9} /></Disc>
              <Texts><Title>{o.title}</Title><Sub>{o.sub}</Sub></Texts>
            </Row>
          </li>
        ))}
      </List>
    </Sheet>
  );
}
