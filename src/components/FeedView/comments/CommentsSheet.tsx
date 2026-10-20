'use client';

import { useEffect, useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { FeedCommentsTarget } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import { LineIcon } from '@/components/common/LineIcons';
import { useCommentThread } from './useCommentThread';
import CommentRow from './CommentRow';
import CommentComposer from './CommentComposer';

const EXIT_MS = 220;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const fadeOut = keyframes`from { opacity: 1; } to { opacity: 0; }`;
const slideUp = keyframes`from { transform: translateY(100%); } to { transform: none; }`;
const slideDown = keyframes`from { transform: none; } to { transform: translateY(100%); }`;
const shimmer = keyframes`0%, 100% { opacity: 0.45; } 50% { opacity: 0.9; }`;

const Backdrop = styled.div<{ $out: boolean }>`
  position: fixed; inset: 0; z-index: 960; background: rgba(3,2,8,0.6);
  backdrop-filter: blur(3px);
  animation: ${p => p.$out ? fadeOut : fadeIn} ${EXIT_MS}ms ease forwards;
`;

const Sheet = styled.div<{ $out: boolean }>`
  position: fixed; z-index: 961; bottom: 0; left: 50%; translate: -50% 0;
  width: 100%; max-width: 560px; height: min(78dvh, 680px);
  display: flex; flex-direction: column; overflow: hidden;
  background: linear-gradient(180deg, #120E20 0%, #0B0915 100%);
  border: 1px solid rgba(232,203,118,0.16); border-bottom: none;
  border-radius: 24px 24px 0 0; box-shadow: 0 -18px 60px rgba(0,0,0,0.55);
  ${p => p.$out
    ? css`animation: ${slideDown} ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards;`
    : css`animation: ${slideUp} 0.34s cubic-bezier(0.22, 1, 0.36, 1);`}
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Grip = styled.div`
  flex-shrink: 0; width: 40px; height: 4px; border-radius: 999px;
  background: rgba(255,255,255,0.2); margin: 9px auto 0;
`;

const Head = styled.div`
  flex-shrink: 0; display: flex; align-items: center; gap: 10px;
  padding: 10px 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.07);
`;

const Title = styled.h2`
  margin: 0; flex: 1; display: flex; align-items: center; gap: 8px;
  color: #FFF9EC; font-family: var(--font-frank, serif); font-size: 1.08rem; font-weight: 800;
`;

const Count = styled.span`color: rgba(255,255,255,0.42); font-family: inherit; font-size: 0.8rem; font-weight: 600;`;

const Context = styled.span<{ $accent: string }>`
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  min-width: 0; max-width: 46%; overflow: hidden; text-overflow: ellipsis;
  color: rgba(${p => p.$accent}, 0.95); background: rgba(${p => p.$accent}, 0.08);
  border: 1px solid rgba(${p => p.$accent}, 0.28); border-radius: 999px;
  padding: 4px 11px; font-size: 0.7rem; font-weight: 700;
`;

const CloseBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none; cursor: pointer;
  width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.8);
  &:hover { background: rgba(255,255,255,0.14); }
`;

const List = styled.ul`
  flex: 1; margin: 0; overflow-y: auto; overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch; padding: 8px 8px 14px;
`;

const Skeleton = styled.li`
  list-style: none; display: flex; gap: 11px; padding: 12px 8px;
  animation: ${shimmer} 1.3s ease-in-out infinite;
  &::before { content: ''; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.08); flex-shrink: 0; }
  &::after { content: ''; flex: 1; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.06); }
`;

const State = styled.li`
  list-style: none; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; text-align: center; min-height: 100%; padding: 30px 28px;
  color: rgba(255,255,255,0.45); font-size: 0.9rem; line-height: 1.7;
  strong { color: rgba(255,250,238,0.88); font-family: var(--font-frank, serif); font-size: 1.1rem; }
`;

const StateIcon = styled.div`color: rgba(232,203,118,0.45); display: flex;`;

const MoreItem = styled.li`list-style: none; padding-top: 4px;`;

const GhostBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none; cursor: pointer;
  align-self: center; margin: 6px auto 0; display: block;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
  border-radius: 999px; padding: 8px 18px; color: rgba(255,250,238,0.85);
  font-size: 0.8rem; font-weight: 700;
  &:disabled { opacity: 0.5; }
`;

interface Props {
  target: FeedCommentsTarget;
  onTotal: (n: number) => void;
  onClose: () => void;
}

// Bottom sheet with one post's comment thread + composer (Instagram-style).
export default function CommentsSheet({ target, onTotal, onClose }: Props) {
  const role = useRole();
  const t = useCommentThread(target, onTotal);
  const [out, setOut] = useState(false);

  const close = useCallback(() => {
    setOut(true);
    setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <>
      <Backdrop $out={out} onClick={close} />
      <Sheet $out={out} role="dialog" aria-modal="true" aria-label={HE.COMMENTS_TITLE} onClick={e => e.stopPropagation()}>
        <Grip />
        <Head>
          <Title>
            {HE.COMMENTS_TITLE}
            {t.status === 'ready' && t.total > 0 && <Count>{t.total}</Count>}
          </Title>
          <Context $accent={target.accent}>
            <LineIcon name={target.icon} size={12} strokeWidth={1.8} />{target.label}
          </Context>
          <CloseBtn onClick={close} aria-label={HE.COMMENTS_CLOSE}><LineIcon name="close" size={16} strokeWidth={2} /></CloseBtn>
        </Head>
        <List>
          {t.status === 'loading' && [0, 1, 2].map(i => <Skeleton key={i} />)}
          {t.status === 'error' && (
            <State>
              <span>{HE.COMMENTS_LOAD_ERROR}</span>
              <GhostBtn onClick={() => void t.load()}>{HE.COMMENTS_RETRY}</GhostBtn>
            </State>
          )}
          {t.status === 'ready' && t.comments.length === 0 && (
            <State>
              <StateIcon><LineIcon name="comment" size={44} strokeWidth={1.3} /></StateIcon>
              <strong>{HE.COMMENTS_EMPTY_TITLE}</strong>
              <span>{HE.COMMENTS_EMPTY_SUB}</span>
            </State>
          )}
          {t.status === 'ready' && t.comments.map(c => (
            <CommentRow
              key={c.id} comment={c} fresh={c.id === t.freshId}
              mine={Boolean(t.tokens[c.id])}
              canDelete={role === 'admin' || Boolean(t.tokens[c.id])}
              onDelete={id => void t.remove(id)}
            />
          ))}
          {t.status === 'ready' && t.hasMore && (
            <MoreItem>
              <GhostBtn onClick={() => void t.loadMore()} disabled={t.loadingMore}>{HE.COMMENTS_LOAD_MORE}</GhostBtn>
            </MoreItem>
          )}
        </List>
        <CommentComposer onSubmit={t.post} />
      </Sheet>
    </>
  );
}
