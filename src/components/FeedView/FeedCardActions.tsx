'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FeedItem, FeedReaction, FeedReactions } from '@/types';
import { HE } from '@/lib/hebrewTexts';

const Actions = styled.div`
  position: absolute; right: 14px; bottom: 28px;
  display: flex; flex-direction: column; gap: 18px; align-items: center;
`;

const ActionGroup = styled.div`display: flex; flex-direction: column; align-items: center; gap: 3px;`;

const btnReset = `
  -webkit-tap-highlight-color: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
`;

const ActionBtn = styled.button<{ $active?: boolean }>`
  ${btnReset}
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; padding: 4px; background: none; border: none; color: white;
  font-size: 1.85rem; line-height: 1; cursor: pointer;
  filter: ${p => p.$active ? 'drop-shadow(0 0 9px rgba(255,140,0,0.85))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'};
  transition: transform 0.15s, filter 0.15s;
  &:active { transform: scale(0.82); }
`;

const SvgBtn = styled.button`
  ${btnReset}
  background: none; border: none; color: white; cursor: pointer; padding: 4px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
  transition: transform 0.15s, filter 0.15s;
  &:active { transform: scale(0.82); }
`;

const ActionCount = styled.span`color: rgba(255,255,255,0.75); font-size: 0.68rem; font-weight: 700;`;

const CopyPill = styled.button<{ $copied: boolean }>`
  ${btnReset}
  background: ${p => p.$copied ? 'rgba(100,220,130,0.18)' : 'rgba(255,255,255,0.1)'};
  border: 1px solid ${p => p.$copied ? 'rgba(100,220,130,0.45)' : 'rgba(255,255,255,0.2)'};
  border-radius: 14px; padding: 5px 9px; cursor: pointer;
  color: ${p => p.$copied ? 'rgba(140,255,160,0.95)' : 'rgba(255,255,255,0.75)'};
  font-size: 1rem; line-height: 1;
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
  font-size: 1.6rem; line-height: 1;
  filter: ${p => p.$saved ? 'drop-shadow(0 0 8px rgba(255,220,80,0.8))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'};
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

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}


const REACTIONS: { key: FeedReaction; emoji: string }[] = [
  { key: 'heart', emoji: '❤️' },
  { key: 'fire',  emoji: '🔥' },
  { key: 'spark', emoji: '✨' },
];

interface Props {
  item: FeedItem;
  reacted: Partial<Record<FeedReaction, true>>;
  isSaved: boolean;
  slideRef: React.RefObject<HTMLDivElement | null>;
  onReact: (item: FeedItem, r: FeedReaction) => void;
  onBookmark: (item: FeedItem) => void;
  copyText?: string;
}

export default function FeedCardActions({ item, reacted, isSaved, slideRef, onReact, onBookmark, copyText }: Props) {
  const [copied, setCopied] = useState(false);
  const [bmkPop, setBmkPop] = useState(false);

  function doShare(text: string) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ text, title: HE.FEED_TITLE }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  function buildShareText(): string {
    const sig = `\n— אורייתא`;
    const d = item.data;
    if (item.type === 'citation') { const c = d as import('@/types').Citation; const l = c.locations[0]; return `"${c.content.slice(0, 250)}"${l ? ` (${l.masechet} דף ${l.daf})` : ''}${sig}`; }
    if (item.type === 'rabbi')    { const r = d as import('@/types').Rabbi; return `${r.name} (${r.datePeriod})\n${r.bio.slice(0, 200)}${sig}`; }
    if (item.type === 'chidush')  { const c = d as import('@/types').Chidush; return `${c.text.slice(0, 250)}${c.source ? `\n(${c.source})` : ''}${sig}`; }
    if (item.type === 'book')     { const b = d as import('@/types').Book; return `${b.title} — ${b.author}${sig}`; }
    if (item.type === 'gematria') { const g = d as import('@/types').FeedGematriaData; return `${g.word} = ${g.value} בגימטריה${sig}`; }
    if (item.type === 'sikum')    { const s = d as import('@/types').FeedSikumData; return `${s.bookName}${s.title ? ` — ${s.title}` : ''}\n${s.text.slice(0, 250)}${sig}`; }
    return sig;
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
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'orayta.png';
        a.click();
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
      {REACTIONS.map(({ key, emoji }) => (
        <ActionGroup key={key}>
          <ActionBtn $active={Boolean(reacted[key])} onClick={e => { e.stopPropagation(); onReact(item, key); }}>
            {emoji}
          </ActionBtn>
          {item.reactions[key] > 0 && <ActionCount>{item.reactions[key]}</ActionCount>}
        </ActionGroup>
      ))}
      <ActionGroup>
        <BookmarkBtn $saved={isSaved} className={bmkPop ? 'pop' : ''} onClick={handleBookmark}>
          {isSaved ? '🔖' : '🏷️'}
        </BookmarkBtn>
      </ActionGroup>
      {copyText && (
        <ActionGroup>
          <CopyPill onClick={doCopy} $copied={copied}>
            {copied ? '✓' : '📋'}
          </CopyPill>
        </ActionGroup>
      )}
      <SvgBtn onClick={e => { e.stopPropagation(); doShare(buildShareText()); }}><ShareIcon /></SvgBtn>
      <SvgBtn onClick={doSave}><CameraIcon /></SvgBtn>
    </Actions>
  );
}
