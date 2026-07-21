'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FeedItem, FeedReaction } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { trackShare } from '@/lib/shareCounter';
import { shareStory, feedStory } from '@/lib/storyShare';

const btnReset = `
  -webkit-tap-highlight-color: transparent; outline: none;
  -webkit-appearance: none; appearance: none;
`;

const Actions = styled.div`
  position: absolute; right: 14px; bottom: 32px;
  display: flex; flex-direction: column; gap: 22px; align-items: center;
`;

const ActionGroup = styled.div`display: flex; flex-direction: column; align-items: center; gap: 3px;`;

const SvgBtn = styled.button`
  ${btnReset}
  background: none; border: none; color: white; cursor: pointer; padding: 4px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
  transition: transform 0.15s, filter 0.15s;
  &:active { transform: scale(0.82); }
`;

const CopyPill = styled.button<{ $copied: boolean }>`
  ${btnReset}
  background: ${p => p.$copied ? 'rgba(100,220,130,0.18)' : 'rgba(255,255,255,0.1)'};
  border: 1px solid ${p => p.$copied ? 'rgba(100,220,130,0.45)' : 'rgba(255,255,255,0.2)'};
  border-radius: 14px; cursor: pointer;
  color: ${p => p.$copied ? 'rgba(140,255,160,0.95)' : 'rgba(255,255,255,0.75)'};
  font-size: 1.05rem; line-height: 1;
  /* Fixed size so icon swap (📋↔✓) never shifts sibling buttons */
  width: 42px; height: 42px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  backdrop-filter: blur(6px);
  &:active { transform: scale(0.88); }
`;

const bookmarkPop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
`;

const BookmarkBtn = styled.button<{ $saved: boolean }>`
  ${btnReset}
  background: none; border: none; cursor: pointer; padding: 4px;
  font-size: 1.65rem; line-height: 1;
  filter: ${p => p.$saved
    ? 'drop-shadow(0 0 9px rgba(255,220,80,0.85))'
    : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'};
  transition: filter 0.2s;
  &.pop { animation: ${bookmarkPop} 0.3s ease; }
`;

function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
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
      navigator.share({ text, title: HE.FEED_TITLE }).then(trackShare).catch(() => {
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
    <Actions>
      <ActionGroup>
        <BookmarkBtn $saved={isSaved} className={bmkPop ? 'pop' : ''} onClick={handleBookmark}>
          {isSaved ? '🔖' : '🏷️'}
        </BookmarkBtn>
      </ActionGroup>
      {copyText && (
        <ActionGroup>
          <CopyPill onClick={doCopy} $copied={copied}>{copied ? '✓' : '📋'}</CopyPill>
        </ActionGroup>
      )}
      <SvgBtn onClick={e => { e.stopPropagation(); doShare(); }}><ShareIcon /></SvgBtn>
      <SvgBtn title={HE.STORY_SHARE_IG} onClick={e => { e.stopPropagation(); shareStory(feedStory(item)); }}><InstagramIcon /></SvgBtn>
      <SvgBtn onClick={doSave}><CameraIcon /></SvgBtn>
    </Actions>
  );
}
