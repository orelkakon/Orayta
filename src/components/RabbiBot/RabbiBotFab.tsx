'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { readBotLocal } from '@/lib/rabbiBot/client';
import RabbiBotAvatar from './RabbiBotAvatar';

/* Bottom-left (the accessibility button owns bottom-right), same z-layer, so
   the drawer, the feed overlay and modals all cover it. */

const ring = keyframes`
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, ${theme.colors.secondary} 55%, transparent); }
  70%, 100% { box-shadow: 0 0 0 14px transparent; }
`;
const bubbleIn = keyframes`from { opacity: 0; transform: translateY(8px) scale(0.92); } to { opacity: 1; transform: none; }`;

const Corner = styled.div`
  position: fixed; bottom: 16px; left: 16px; z-index: ${theme.z.fab};
  display: flex; align-items: flex-end; gap: ${theme.spacing.sm}; direction: ltr;
  @media (max-width: 768px) { bottom: calc(80px + env(safe-area-inset-bottom)); left: 12px; }
`;

const Button = styled.button`
  position: relative; display: flex; align-items: center; gap: 8px; direction: rtl;
  height: 64px; padding: 0 6px 0 20px; border-radius: 999px;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  border: 2px solid color-mix(in srgb, ${theme.colors.secondary} 70%, transparent);
  box-shadow: ${theme.shadows.lg};
  animation: ${ring} 2.8s ease-out 1.5s 3;
  transition: transform ${theme.motion.fast} ${theme.motion.out};
  &:hover { transform: translateY(-2px) scale(1.03); }
  &:active { transform: scale(0.95); }
  @media (max-width: 768px) { width: 62px; height: 62px; padding: 0; justify-content: center; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Face = styled.span`
  width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.surface};
`;

const Label = styled.span`
  display: flex; flex-direction: column; line-height: 1.15; text-align: start;
  & > b { font-size: ${theme.fontSizes.md}; font-weight: 800; }
  & > small { font-size: ${theme.fontSizes.xs}; opacity: 0.85; }
  @media (max-width: 768px) { display: none; }
`;

const Bubble = styled.div`
  position: relative; max-width: 210px; direction: rtl; margin-bottom: 30px;
  padding: ${theme.spacing.sm} ${theme.spacing.md}; padding-inline-end: 30px;
  border-radius: ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.sm};
  background: ${theme.colors.surface}; color: ${theme.colors.text}; border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.md}; font-size: ${theme.fontSizes.sm}; font-weight: 600; line-height: 1.45;
  cursor: pointer; animation: ${bubbleIn} 0.35s ${theme.motion.spring} both;
  @media (min-width: 769px) { display: none; }
`;

const BubbleClose = styled.button`
  position: absolute; top: 4px; inset-inline-end: 4px; width: 24px; height: 24px; border-radius: 50%;
  font-size: 13px; color: ${theme.colors.textMuted};
`;

// The bubble introduces the bot to people who haven't used it: a few times, at most once a day.
const TEASER_KEY = 'orayta_rabbibot_teaser';
const TEASER_MAX = 4;
const TEASER_GAP_MS = 20 * 3600_000;

function teaserDue(): boolean {
  try {
    if (readBotLocal().welcomed) return false;
    const t = JSON.parse(localStorage.getItem(TEASER_KEY) ?? '{}') as { n?: number; at?: number };
    return (t.n ?? 0) < TEASER_MAX && Date.now() - (t.at ?? 0) > TEASER_GAP_MS;
  } catch { return false; }
}

function teaserSeen(forever: boolean): void {
  try {
    const t = JSON.parse(localStorage.getItem(TEASER_KEY) ?? '{}') as { n?: number };
    localStorage.setItem(TEASER_KEY, JSON.stringify({ n: forever ? TEASER_MAX : (t.n ?? 0) + 1, at: Date.now() }));
  } catch { /* storage blocked */ }
}

export default function RabbiBotFab({ onOpen }: { onOpen: () => void }) {
  const [teaser, setTeaser] = useState(false);

  useEffect(() => {
    if (!teaserDue()) return;
    const show = window.setTimeout(() => { setTeaser(true); teaserSeen(false); }, 3500);
    const hide = window.setTimeout(() => setTeaser(false), 14_000);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, []);

  const open = () => { setTeaser(false); onOpen(); };

  return (
    <Corner>
      <Button type="button" onClick={open} aria-label={HE.RB_FAB} aria-haspopup="dialog">
        <Face><RabbiBotAvatar size={50} /></Face>
        <Label><b>{HE.RB_NAME}</b><small>{HE.RB_FAB}</small></Label>
      </Button>
      {teaser && (
        <Bubble role="status" onClick={open}>
          {HE.RB_TEASER}
          <BubbleClose type="button" aria-label={HE.RB_TEASER_CLOSE} onClick={e => { e.stopPropagation(); setTeaser(false); teaserSeen(true); }}>✕</BubbleClose>
        </Bubble>
      )}
    </Corner>
  );
}
