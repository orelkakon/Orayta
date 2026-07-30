'use client';

import styled from 'styled-components';
import type { FeedItem, FeedReaction } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { FEED_TYPE_STYLES, FEED_GOLD } from './feedTypes';
import { LineIcon } from '@/components/common/LineIcons';

const Panel = styled.div<{ $open: boolean }>`
  position: fixed; inset: 0; z-index: 500; background: #08060F;
  transform: translateX(${p => p.$open ? '0' : '100%'});
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex; flex-direction: column; overflow: hidden;
`;

const Header = styled.div`
  flex-shrink: 0; padding: calc(14px + env(safe-area-inset-top)) 16px 14px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.07);
`;

const BackBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 999px;
  color: rgba(255,252,244,0.9); font-size: 0.85rem; font-weight: 700;
  padding: 8px 16px; cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.16); }
`;

const TitleRow = styled.div`
  display: flex; align-items: center; gap: 8px;
  color: #FFF9EC; font-family: var(--font-frank, serif); font-size: 1rem; font-weight: 700;
`;

const TitleIcon = styled.span`color: rgba(${FEED_GOLD}, 0.9); display: flex;`;

const Badge = styled.span`
  background: rgba(${FEED_GOLD}, 0.14); border: 1px solid rgba(${FEED_GOLD}, 0.4);
  color: rgba(${FEED_GOLD}, 0.95); border-radius: 999px; font-size: 0.72rem;
  padding: 2px 9px; font-weight: 700;
`;

const List = styled.div`flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;`;

const Empty = styled.div`
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; text-align: center; padding: 40px 24px;
  color: rgba(255,255,255,0.4); font-size: 0.9rem; line-height: 1.7;
`;

const EmptyIcon = styled.div`color: rgba(${FEED_GOLD}, 0.4); display: flex;`;

const Card = styled.div<{ $accent: string }>`
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.09);
  border-right: 3px solid rgba(${p => p.$accent}, 0.65);
  border-radius: 14px; padding: 14px; position: relative;
`;

const TypeIcon = styled.div<{ $accent: string }>`
  color: rgb(${p => p.$accent}); flex-shrink: 0; margin-top: 2px; display: flex;
`;

const TextCol = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;`;

const Preview = styled.div`
  color: rgba(255,251,240,0.92); font-family: var(--font-frank, serif);
  font-size: 0.92rem; line-height: 1.6;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 3; -webkit-box-orient: vertical;
`;

const Meta = styled.div<{ $accent: string }>`color: rgba(${p => p.$accent}, 0.75); font-size: 0.72rem; font-weight: 700;`;

const RemoveBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none;
  flex-shrink: 0; align-self: flex-start; margin-top: 1px;
  background: rgba(255,255,255,0.08); border: none; border-radius: 50%;
  width: 24px; height: 24px; color: rgba(255,255,255,0.45);
  font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255,100,100,0.2); color: rgba(255,150,150,0.9); }
`;

function getPreview(item: FeedItem): { text: string; meta: string } {
  if (item.type === 'citation') {
    const d = item.data as import('@/types').Citation;
    const l = d.locations[0];
    return { text: d.content, meta: l ? `${l.masechet} · דף ${l.daf}` : '' };
  }
  if (item.type === 'rabbi') {
    const d = item.data as import('@/types').Rabbi;
    return { text: d.bio, meta: d.name };
  }
  if (item.type === 'book') {
    const d = item.data as import('@/types').Book;
    return { text: d.title, meta: d.author };
  }
  if (item.type === 'chidush') {
    const d = item.data as import('@/types').Chidush;
    return { text: d.text, meta: d.source ?? '' };
  }
  if (item.type === 'gematria') {
    const d = item.data as import('@/types').FeedGematriaData;
    return { text: `${d.word} = ${d.value} בגימטריה`, meta: '' };
  }
  if (item.type === 'sikum') {
    const d = item.data as import('@/types').FeedSikumData;
    return { text: d.text, meta: d.bookName };
  }
  return { text: '', meta: '' };
}

interface Props {
  open: boolean;
  items: FeedItem[];
  onClose: () => void;
  onRemove: (item: FeedItem) => void;
  reacted: Record<string, Partial<Record<FeedReaction, true>>>;
}

export default function SavedPanel({ open, items, onClose, onRemove }: Props) {
  return (
    <Panel $open={open}>
      <Header>
        <BackBtn onClick={onClose}>{HE.FEED_SAVED_BACK}</BackBtn>
        <TitleRow>
          <TitleIcon><LineIcon name="bookmark" size={16} strokeWidth={1.8} filled /></TitleIcon>
          {HE.FEED_SAVED_TITLE}
          {items.length > 0 && <Badge>{items.length}</Badge>}
        </TitleRow>
      </Header>

      {items.length === 0 ? (
        <Empty>
          <EmptyIcon><LineIcon name="bookmark" size={44} strokeWidth={1.4} /></EmptyIcon>
          <span>{HE.FEED_SAVED_EMPTY}</span>
        </Empty>
      ) : (
        <List>
          {items.map(item => {
            const cfg = FEED_TYPE_STYLES[item.type];
            const { text, meta } = getPreview(item);
            return (
              <Card key={`${item.type}:${item.id}`} $accent={cfg.accent}>
                <TypeIcon $accent={cfg.accent}><LineIcon name={cfg.icon} size={20} strokeWidth={1.8} /></TypeIcon>
                <TextCol>
                  <Preview>{text}</Preview>
                  {meta && <Meta $accent={cfg.accent}>{meta}</Meta>}
                </TextCol>
                <RemoveBtn onClick={() => onRemove(item)} aria-label={HE.FEED_BOOKMARK_REMOVE}>✕</RemoveBtn>
              </Card>
            );
          })}
        </List>
      )}
    </Panel>
  );
}
