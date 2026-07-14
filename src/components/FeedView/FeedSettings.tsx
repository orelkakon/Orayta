'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { FeedItemType } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { ALL_FEED_TYPES } from '@/lib/feedPrefs';

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

const TypeCard = styled.button<{ $on: boolean; $grad: string }>`
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 14px; cursor: pointer;
  background: ${p => p.$on ? p.$grad : 'rgba(255,255,255,0.04)'};
  border: 1px solid ${p => p.$on ? 'rgba(255,220,80,0.45)' : 'rgba(255,255,255,0.09)'};
  opacity: ${p => p.$on ? 1 : 0.55};
  transition: background 0.2s, border-color 0.2s, opacity 0.2s, transform 0.12s;
  &:active { transform: scale(0.96); }
`;

const TypeIcon = styled.span<{ $on: boolean }>`
  font-size: 1.35rem; filter: ${p => p.$on ? 'none' : 'grayscale(1)'};
  transition: filter 0.2s;
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

interface TypeMeta { type: FeedItemType; icon: string; label: string; grad: string; }

const TYPE_META: TypeMeta[] = [
  { type: 'citation', icon: '📜', label: HE.FEED_TYPE_CITATION, grad: 'linear-gradient(135deg,#0a1436,#14286e)' },
  { type: 'rabbi',    icon: '👥', label: HE.FEED_TYPE_RABBI,    grad: 'linear-gradient(135deg,#241000,#57300a)' },
  { type: 'book',     icon: '📚', label: HE.FEED_TYPE_BOOK,     grad: 'linear-gradient(135deg,#08200f,#12401f)' },
  { type: 'chidush',  icon: '💡', label: HE.FEED_TYPE_CHIDUSH,  grad: 'linear-gradient(135deg,#201000,#502505)' },
  { type: 'gematria', icon: '🔢', label: HE.FEED_TYPE_GEMATRIA, grad: 'linear-gradient(135deg,#0c0630,#1e1068)' },
  { type: 'sikum',    icon: '📝', label: HE.FEED_TYPE_SIKUM,    grad: 'linear-gradient(135deg,#1c0828,#421256)' },
];

interface Props {
  open: boolean;
  selected: FeedItemType[];
  onClose: () => void;
  onSave: (types: FeedItemType[]) => void;
}

export default function FeedSettings({ open, selected, onClose, onSave }: Props) {
  const [sel, setSel] = useState<Set<FeedItemType>>(new Set(selected));

  useEffect(() => {
    if (open) setSel(new Set(selected));
  }, [open, selected]);

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

  const handleSave = () => onSave(ALL_FEED_TYPES.filter(t => sel.has(t)));

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
              <TypeCard key={m.type} $on={on} $grad={m.grad} onClick={() => toggle(m.type)}>
                <TypeIcon $on={on}>{m.icon}</TypeIcon>
                <TypeLabel $on={on}>{m.label}</TypeLabel>
                <Check $on={on}>✓</Check>
              </TypeCard>
            );
          })}
        </Grid>
        <Footer>
          <AllBtn onClick={() => setSel(new Set(ALL_FEED_TYPES))}>{HE.FEED_SETTINGS_ALL}</AllBtn>
          <SaveBtn onClick={handleSave}>{HE.FEED_SETTINGS_SAVE}</SaveBtn>
        </Footer>
      </Sheet>
    </>
  );
}
