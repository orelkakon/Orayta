'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FeedComment } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { avatarTint } from '@/lib/feedComments';
import { formatCommentAge } from './formatCommentAge';
import { LineIcon } from '@/components/common/LineIcons';

const arrive = keyframes`
  from { opacity: 0; transform: translateY(-8px); background: rgba(232,203,118,0.14); }
  to   { opacity: 1; transform: none; background: transparent; }
`;

const Row = styled.li<{ $fresh: boolean }>`
  list-style: none; display: flex; gap: 11px; align-items: flex-start;
  padding: 10px 8px; border-radius: 14px;
  animation: ${p => p.$fresh ? arrive : 'none'} 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Avatar = styled.div<{ $tint: string }>`
  flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(${p => p.$tint}, 0.16); border: 1px solid rgba(${p => p.$tint}, 0.4);
  color: rgb(${p => p.$tint}); font-size: 0.9rem; font-weight: 800;
`;

const Body = styled.div`flex: 1; min-width: 0;`;

const Head = styled.div`display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;`;

const Name = styled.span`
  color: rgba(255,250,238,0.95); font-size: 0.84rem; font-weight: 800;
  max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const You = styled.span`
  color: rgba(232,203,118,0.9); font-size: 0.68rem; font-weight: 700;
  border: 1px solid rgba(232,203,118,0.35); border-radius: 999px; padding: 0 7px;
`;

const Age = styled.time`color: rgba(255,255,255,0.38); font-size: 0.72rem;`;

const Text = styled.p`
  margin: 3px 0 0; color: rgba(255,251,240,0.88);
  font-family: var(--font-frank, serif); font-size: 0.98rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: anywhere;
`;

const DeleteBtn = styled.button<{ $armed: boolean }>`
  -webkit-tap-highlight-color: transparent; appearance: none; cursor: pointer;
  flex-shrink: 0; align-self: center; display: flex; align-items: center; justify-content: center; gap: 4px;
  min-width: 32px; height: 32px; border-radius: 999px; border: none; padding: 0 ${p => p.$armed ? '10px' : '0'};
  font-family: inherit; font-size: 0.72rem; font-weight: 800;
  background: ${p => p.$armed ? 'rgba(255,110,110,0.18)' : 'transparent'};
  color: ${p => p.$armed ? 'rgba(255,170,170,1)' : 'rgba(255,255,255,0.35)'};
  transition: background 0.15s, color 0.15s;
  &:hover, &:focus-visible { background: rgba(255,110,110,0.14); color: rgba(255,160,160,0.95); }
`;

interface Props {
  comment: FeedComment;
  mine: boolean;
  canDelete: boolean;
  fresh: boolean;
  onDelete: (id: string) => void;
}

export default function CommentRow({ comment, mine, canDelete, fresh, onDelete }: Props) {
  const name = comment.name ?? HE.COMMENTS_ANON;
  const label = mine ? HE.COMMENTS_DELETE : HE.COMMENTS_DELETE_ADMIN;
  // Two-step delete: first tap arms, second confirms; disarms by itself.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Row $fresh={fresh}>
      <Avatar $tint={avatarTint(name)} aria-hidden>{Array.from(name)[0]}</Avatar>
      <Body>
        <Head>
          <Name>{name}</Name>
          {mine && <You>{HE.COMMENTS_YOU}</You>}
          <Age dateTime={comment.createdAt}>{formatCommentAge(comment.createdAt)}</Age>
        </Head>
        <Text>{comment.text}</Text>
      </Body>
      {canDelete && (
        <DeleteBtn
          $armed={armed} aria-label={armed ? HE.COMMENTS_DELETE_CONFIRM : label} title={label}
          onClick={() => armed ? onDelete(comment.id) : setArmed(true)}
        >
          <LineIcon name="trash" size={16} strokeWidth={1.8} />
          {armed && HE.COMMENTS_DELETE_CONFIRM}
        </DeleteBtn>
      )}
    </Row>
  );
}
