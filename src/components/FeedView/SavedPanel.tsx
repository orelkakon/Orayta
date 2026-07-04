'use client';

import styled from 'styled-components';
import type { FeedItem, FeedReaction } from '@/types';
import { HE } from '@/lib/hebrewTexts';

const Panel = styled.div<{ $open: boolean }>`
  position: fixed; inset: 0; z-index: 500; background: #07050f;
  transform: translateX(${p => p.$open ? '0' : '100%'});
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex; flex-direction: column; overflow: hidden;
`;

const Header = styled.div`
  flex-shrink: 0; padding: 16px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.55), transparent);
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.07);
`;

const BackBtn = styled.button`
  background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.18); border-radius: 20px;
  color: white; font-size: 0.85rem; font-weight: 700;
  padding: 7px 16px; cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.2); }
`;

const TitleRow = styled.div`
  display: flex; align-items: center; gap: 8px;
  color: white; font-family: var(--font-frank, serif); font-size: 1rem; font-weight: 700;
`;

const Badge = styled.span`
  background: rgba(255,220,80,0.25); border: 1px solid rgba(255,220,80,0.4);
  color: rgba(255,220,80,0.9); border-radius: 12px; font-size: 0.72rem;
  padding: 2px 8px; font-weight: 700;
`;

const List = styled.div`flex: 1; overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px;`;

const Empty = styled.div`
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; text-align: center; padding: 40px 24px;
  color: rgba(255,255,255,0.35); font-size: 0.9rem; line-height: 1.6;
`;

const TYPE_CONFIG: Record<string, { icon: string; grad: string }> = {
  citation: { icon: '📜', grad: 'linear-gradient(135deg,#050a1e,#0d1a52)' },
  rabbi:    { icon: '👥', grad: 'linear-gradient(135deg,#150800,#3d1e00)' },
  book:     { icon: '📚', grad: 'linear-gradient(135deg,#041008,#0a2e14)' },
  chidush:  { icon: '💡', grad: 'linear-gradient(135deg,#120800,#3d1800)' },
  gematria: { icon: '🔢', grad: 'linear-gradient(135deg,#06021a,#140852)' },
  sikum:    { icon: '📝', grad: 'linear-gradient(135deg,#12041a,#320a40)' },
};

const Card = styled.div<{ $grad: string }>`
  display: flex; align-items: flex-start; gap: 12px;
  background: ${p => p.$grad}; border-radius: 14px;
  padding: 14px; border: 1px solid rgba(255,255,255,0.08);
  position: relative;
`;

const TypeIcon = styled.div`font-size: 1.6rem; flex-shrink: 0; margin-top: 2px;`;

const TextCol = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;`;

const Preview = styled.div`
  color: rgba(255,255,255,0.9); font-family: var(--font-frank, serif);
  font-size: 0.9rem; line-height: 1.55;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 3; -webkit-box-orient: vertical;
`;

const Meta = styled.div`color: rgba(255,255,255,0.4); font-size: 0.72rem;`;

const RemoveBtn = styled.button`
  position: absolute; top: 10px; left: 10px;
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
          🔖 {HE.FEED_SAVED_TITLE}
          {items.length > 0 && <Badge>{items.length}</Badge>}
        </TitleRow>
      </Header>

      {items.length === 0 ? (
        <Empty>
          <span style={{ fontSize: '2.5rem' }}>🔖</span>
          <span>{HE.FEED_SAVED_EMPTY}</span>
        </Empty>
      ) : (
        <List>
          {items.map(item => {
            const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.citation;
            const { text, meta } = getPreview(item);
            return (
              <Card key={`${item.type}:${item.id}`} $grad={cfg.grad}>
                <TypeIcon>{cfg.icon}</TypeIcon>
                <TextCol>
                  <Preview>{text}</Preview>
                  {meta && <Meta>{meta}</Meta>}
                </TextCol>
                <RemoveBtn onClick={() => onRemove(item)}>✕</RemoveBtn>
              </Card>
            );
          })}
        </List>
      )}
    </Panel>
  );
}
