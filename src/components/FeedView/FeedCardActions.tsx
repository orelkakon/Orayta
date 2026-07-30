'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FeedItem } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { trackShare } from '@/lib/shareCounter';
import { shareStory, feedStory } from '@/lib/storyShare';
import { LineIcon } from '@/components/common/LineIcons';
import { FEED_GOLD } from './feedTypes';

const COPY_TINT = '120,220,150';

const Rail = styled.div`
  position: absolute; right: 12px; bottom: 96px; z-index: 6;
  display: flex; flex-direction: column; gap: 12px; align-items: center;
`;

const RailBtn = styled.button<{ $active?: boolean; $tint?: string }>`
  -webkit-tap-highlight-color: transparent; outline: none;
  -webkit-appearance: none; appearance: none;
  width: 46px; height: 46px; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: ${p => p.$active && p.$tint ? `rgba(${p.$tint}, 0.16)` : 'rgba(12,9,22,0.4)'};
  border: 1px solid ${p => p.$active && p.$tint ? `rgba(${p.$tint}, 0.55)` : 'rgba(255,255,255,0.14)'};
  color: ${p => p.$active && p.$tint ? `rgb(${p.$tint})` : 'rgba(255,255,255,0.92)'};
  backdrop-filter: blur(14px);
  box-shadow: ${p => p.$active && p.$tint ? `0 0 18px rgba(${p.$tint}, 0.3)` : '0 4px 16px rgba(0,0,0,0.3)'};
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s, transform 0.14s;
  &:active { transform: scale(0.85); }
`;

const bookmarkPop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.3); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
`;

const BookmarkRailBtn = styled(RailBtn)`
  &.pop { animation: ${bookmarkPop} 0.3s ease; }
`;

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

interface Props {
  item: FeedItem;
  isSaved: boolean;
  slideRef: React.RefObject<HTMLDivElement | null>;
  onBookmark: (item: FeedItem) => void;
  copyText?: string;
}

export default function FeedCardActions({ item, isSaved, slideRef, onBookmark, copyText }: Props) {
  const [copied, setCopied] = useState(false);
  const [bmkPop, setBmkPop] = useState(false);

  function doShare() {
    const sig = `\n— אורייתא`;
    const d = item.data;
    let text = sig;
    if (item.type === 'citation') { const c = d as import('@/types').Citation; const l = c.locations[0]; text = `"${c.content.slice(0, 250)}"${l ? ` (${l.masechet} דף ${l.daf})` : ''}${sig}`; }
    else if (item.type === 'rabbi')   { const r = d as import('@/types').Rabbi;   text = `${r.name} (${r.datePeriod})\n${r.bio.slice(0, 200)}${sig}`; }
    else if (item.type === 'chidush') { const c = d as import('@/types').Chidush; text = `${c.text.slice(0, 250)}${c.source ? `\n(${c.source})` : ''}${sig}`; }
    else if (item.type === 'book')    { const b = d as import('@/types').Book;    text = `${b.title} — ${b.author}${sig}`; }
    else if (item.type === 'gematria'){ const g = d as import('@/types').FeedGematriaData; text = `${g.word} = ${g.value} בגימטריה${sig}`; }
    else if (item.type === 'sikum')   { const s = d as import('@/types').FeedSikumData;   text = `${s.bookName}${s.title ? ` — ${s.title}` : ''}\n${s.text.slice(0, 250)}${sig}`; }
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ text, title: HE.FEED_TITLE }).then(() => trackShare()).catch(() => {
        trackShare();
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      trackShare();
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  async function doSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (!slideRef.current) return;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(slideRef.current, { useCORS: true, scale: 2, backgroundColor: null });
    canvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], 'orayta.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] }).catch(() => {});
      } else {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orayta.png'; a.click();
      }
    });
  }

  async function doCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    onBookmark(item);
    setBmkPop(true);
    setTimeout(() => setBmkPop(false), 350);
  }

  return (
    <Rail>
      <BookmarkRailBtn
        $active={isSaved} $tint={FEED_GOLD}
        className={bmkPop ? 'pop' : ''}
        onClick={handleBookmark}
        aria-label={isSaved ? HE.FEED_BOOKMARK_REMOVE : HE.FEED_BOOKMARK_ADD}
        title={isSaved ? HE.FEED_BOOKMARK_REMOVE : HE.FEED_BOOKMARK_ADD}
      >
        <LineIcon name="bookmark" size={21} strokeWidth={2} filled={isSaved} />
      </BookmarkRailBtn>
      {copyText && (
        <RailBtn $active={copied} $tint={COPY_TINT} onClick={doCopy} aria-label={HE.FEED_COPY} title={HE.FEED_COPY}>
          <LineIcon name={copied ? 'check' : 'copy'} size={19} strokeWidth={2} />
        </RailBtn>
      )}
      <RailBtn onClick={e => { e.stopPropagation(); doShare(); }} aria-label={HE.FEED_REEL_SHARE} title={HE.FEED_REEL_SHARE}>
        <ShareIcon />
      </RailBtn>
      <RailBtn onClick={e => { e.stopPropagation(); shareStory(feedStory(item)); }} aria-label={HE.STORY_SHARE_IG} title={HE.STORY_SHARE_IG}>
        <InstagramIcon />
      </RailBtn>
      <RailBtn onClick={doSave} aria-label={HE.FEED_ACTION_IMAGE} title={HE.FEED_ACTION_IMAGE}>
        <LineIcon name="camera" size={20} strokeWidth={2} />
      </RailBtn>
    </Rail>
  );
}
