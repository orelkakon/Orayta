'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import type { FeedItemType } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { ALL_FEED_TYPES, FeedPrefs } from '@/lib/feedPrefs';
import { useRole } from '@/components/common/RoleContext';
import { FEED_TYPE_STYLES } from './feedTypes';
import { LineIcon } from '@/components/common/LineIcons';

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed; inset: 0; z-index: 600;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  opacity: ${p => p.$open ? 1 : 0};
  pointer-events: ${p => p.$open ? 'auto' : 'none'};
  transition: opacity 0.25s ease;
`;

const Sheet = styled.div<{ $open: boolean }>`
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 610;
  max-width: 520px; margin: 0 auto;
  background: linear-gradient(180deg, #14111f 0%, #0a0814 100%);
  border: 1px solid rgba(255,255,255,0.12); border-bottom: none;
  border-radius: 24px 24px 0 0;
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom));
  transform: translateY(${p => p.$open ? '0' : '105%'});
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 -18px 50px rgba(0,0,0,0.55);
`;

const Handle = styled.div`
  width: 40px; height: 4px; border-radius: 2px;
  background: rgba(255,255,255,0.22); margin: 0 auto 14px;
`;

const Title = styled.div`
  color: white; font-family: var(--font-frank, serif);
  font-size: 1.15rem; font-weight: 700; text-align: center;
`;

const Subtitle = styled.div`
  color: rgba(255,255,255,0.45); font-size: 0.82rem;
  text-align: center; margin: 4px 0 16px;
`;

const Grid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 10px;`;

const TypeCard = styled.button<{ $on: boolean; $grad: string; $accent: string }>`
  -webkit-tap-highlight-color: transparent; appearance: none;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 14px; cursor: pointer;
  background: ${p => p.$on ? p.$grad : 'rgba(255,255,255,0.04)'};
  border: 1px solid ${p => p.$on ? `rgba(${p.$accent},0.5)` : 'rgba(255,255,255,0.09)'};
  opacity: ${p => p.$on ? 1 : 0.55};
  transition: background 0.2s, border-color 0.2s, opacity 0.2s, transform 0.12s;
  &:active { transform: scale(0.96); }
`;

const TypeIcon = styled.span<{ $on: boolean; $accent: string }>`
  display: flex; color: ${p => p.$on ? `rgb(${p.$accent})` : 'rgba(255,255,255,0.35)'};
  transition: color 0.2s;
`;

const TypeLabel = styled.span<{ $on: boolean }>`
  flex: 1; text-align: start;
  color: ${p => p.$on ? 'white' : 'rgba(255,255,255,0.55)'};
  font-size: 0.85rem; font-weight: 700;
`;

const Check = styled.span<{ $on: boolean }>`
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 900;
  background: ${p => p.$on ? 'rgba(255,220,80,0.9)' : 'transparent'};
  color: ${p => p.$on ? '#1a1400' : 'transparent'};
  border: 1px solid ${p => p.$on ? 'rgba(255,220,80,0.9)' : 'rgba(255,255,255,0.2)'};
  transition: background 0.2s, border-color 0.2s;
`;

const SectionTitle = styled.div`
  color: rgba(255,255,255,0.45); font-size: 0.78rem; font-weight: 700;
  margin: 14px 2px 8px; letter-spacing: 0.02em;
`;

const AdminLink = styled(Link)`
  display: block; text-align: center; margin-top: 12px;
  color: rgba(160,130,255,0.85); font-size: 0.82rem; font-weight: 700;
  padding: 8px; border: 1px dashed rgba(160,130,255,0.35); border-radius: 12px;
  &:hover { background: rgba(160,130,255,0.08); }
`;

const Footer = styled.div`display: flex; gap: 10px; margin-top: 18px;`;

const AllBtn = styled.button`
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px; color: rgba(255,255,255,0.75);
  font-size: 0.85rem; font-weight: 700; padding: 12px 16px; cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.14); }
`;

const SaveBtn = styled.button`
  flex: 1; border: none; border-radius: 14px; cursor: pointer;
  background: linear-gradient(135deg, #ffd950, #f0a818);
  color: #241a00; font-size: 0.95rem; font-weight: 800; padding: 12px 16px;
  box-shadow: 0 4px 18px rgba(255,190,0,0.25);
  transition: transform 0.12s, box-shadow 0.2s;
  &:active { transform: scale(0.98); }
`;

const TYPE_META = ALL_FEED_TYPES.map((type: FeedItemType) => ({ type, ...FEED_TYPE_STYLES[type] }));

const REELS_ACCENT = '244,114,182';
const DEDS_ACCENT  = '226,190,120';

interface Props {
  open: boolean;
  prefs: FeedPrefs;
  onClose: () => void;
  onSave: (prefs: FeedPrefs) => void;
}

export default function FeedSettings({ open, prefs, onClose, onSave }: Props) {
  const role = useRole();
  const [sel, setSel]         = useState<Set<FeedItemType>>(new Set(prefs.types));
  const [reels, setReels]     = useState(prefs.reels);
  const [deds, setDeds]       = useState(prefs.dedications);

  useEffect(() => {
    if (open) { setSel(new Set(prefs.types)); setReels(prefs.reels); setDeds(prefs.dedications); }
  }, [open, prefs]);

  const toggle = (type: FeedItemType) => {
    setSel(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) return prev; // at least one type must stay on
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleSave = () => onSave({
    types: ALL_FEED_TYPES.filter(t => sel.has(t)),
    reels,
    dedications: deds,
  });

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Sheet $open={open}>
        <Handle />
        <Title>{HE.FEED_SETTINGS_TITLE}</Title>
        <Subtitle>{HE.FEED_SETTINGS_SUBTITLE}</Subtitle>
        <Grid>
          {TYPE_META.map(m => {
            const on = sel.has(m.type);
            return (
              <TypeCard key={m.type} $on={on} $grad={m.chip} $accent={m.accent} onClick={() => toggle(m.type)}>
                <TypeIcon $on={on} $accent={m.accent}><LineIcon name={m.icon} size={19} strokeWidth={1.8} /></TypeIcon>
                <TypeLabel $on={on}>{m.label}</TypeLabel>
                <Check $on={on}>✓</Check>
              </TypeCard>
            );
          })}
        </Grid>
        <SectionTitle>{HE.FEED_SETTINGS_EXTRAS}</SectionTitle>
        <Grid>
          <TypeCard $on={reels} $grad="linear-gradient(135deg,#2a0a20,#5c1440)" $accent={REELS_ACCENT} onClick={() => setReels(v => !v)}>
            <TypeIcon $on={reels} $accent={REELS_ACCENT}><LineIcon name="camera" size={19} strokeWidth={1.8} /></TypeIcon>
            <TypeLabel $on={reels}>{HE.FEED_SETTINGS_REELS}</TypeLabel>
            <Check $on={reels}>✓</Check>
          </TypeCard>
          <TypeCard $on={deds} $grad="linear-gradient(135deg,#221604,#4a3410)" $accent={DEDS_ACCENT} onClick={() => setDeds(v => !v)}>
            <TypeIcon $on={deds} $accent={DEDS_ACCENT}><LineIcon name="candle" size={19} strokeWidth={1.8} /></TypeIcon>
            <TypeLabel $on={deds}>{HE.FEED_SETTINGS_DEDICATIONS}</TypeLabel>
            <Check $on={deds}>✓</Check>
          </TypeCard>
        </Grid>
        <Footer>
          <AllBtn onClick={() => { setSel(new Set(ALL_FEED_TYPES)); setReels(true); setDeds(true); }}>{HE.FEED_SETTINGS_ALL}</AllBtn>
          <SaveBtn onClick={handleSave}>{HE.FEED_SETTINGS_SAVE}</SaveBtn>
        </Footer>
        {role === 'admin' && <AdminLink href="/feed-videos">{HE.FEED_SETTINGS_MANAGE_REELS}</AdminLink>}
      </Sheet>
    </>
  );
}
