'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { commentTargetMeta } from '@/components/FeedView/feedTypes';
import { formatCommentAge } from '@/components/FeedView/comments/formatCommentAge';
import type { AdminCommentStats, AdminCommentPost } from '@/types';

const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.md}; align-items: start;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

const Col = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm}; min-width: 0;`;
const ColTitle = styled.h3`font-size: 0.82rem; font-weight: 700; color: ${theme.colors.textMuted};`;
const List = styled.ol`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column;`;

const Item = styled.li`
  display: flex; gap: ${theme.spacing.sm}; align-items: flex-start; min-width: 0;
  padding: ${theme.spacing.sm} 0;
  &:not(:last-child) { border-bottom: 1px solid ${theme.colors.borderLight}; }
`;

const Rank = styled.span`
  flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: ${theme.fonts.ui}; font-size: 0.72rem; font-weight: 700;
  color: ${theme.colors.secondary}; background: ${theme.colors.surfaceAlt};
`;

const Body = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;

const PostTag = styled.span`
  display: inline-flex; align-items: center; gap: 4px; min-width: 0;
  font-size: 0.7rem; font-weight: 600; color: ${theme.colors.textLight};
`;

const OneLine = styled.span`
  font-size: 0.84rem; color: ${theme.colors.text}; line-height: 1.5;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const TagText = styled.span`min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;

const Quote = styled.span`
  font-family: ${theme.fonts.body}; font-size: 0.9rem; color: ${theme.colors.text}; line-height: 1.55;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
`;

const Byline = styled.span`font-size: 0.72rem; color: ${theme.colors.textMuted}; strong { color: ${theme.colors.text}; }`;

const Count = styled.span`
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;
  font-family: ${theme.fonts.ui}; font-size: 0.85rem; font-weight: 700; color: ${theme.colors.primary};
`;

function Tag({ post }: { post: AdminCommentPost }) {
  const meta = commentTargetMeta(post.type);
  return (
    <PostTag>
      <LineIcon name={meta.icon} size={12} strokeWidth={1.8} />
      <TagText>{meta.label}{post.preview ? ` · ${post.preview}` : ''}</TagText>
    </PostTag>
  );
}

type Props = Pick<AdminCommentStats, 'top' | 'recent'>;

export default function AdminCommentsLists({ top, recent }: Props) {
  return (
    <Grid>
      <Col>
        <ColTitle>{HE.ADMIN_COMMENTS_TOP}</ColTitle>
        <List>
          {top.map((p, i) => (
            <Item key={`${p.type}:${p.id}`}>
              <Rank>{i + 1}</Rank>
              <Body>
                <OneLine>{p.preview || commentTargetMeta(p.type).label}</OneLine>
                <Tag post={{ ...p, preview: '' }} />
              </Body>
              <Count><LineIcon name="comment" size={14} strokeWidth={2} />{p.count.toLocaleString('he-IL')}</Count>
            </Item>
          ))}
        </List>
      </Col>
      <Col>
        <ColTitle>{HE.ADMIN_COMMENTS_RECENT}</ColTitle>
        <List>
          {recent.map(c => (
            <Item key={c.id}>
              <Body>
                <Quote>{c.text}</Quote>
                <Byline><strong>{c.name ?? HE.COMMENTS_ANON}</strong> · {formatCommentAge(c.createdAt)}</Byline>
                <Tag post={c.post} />
              </Body>
            </Item>
          ))}
        </List>
      </Col>
    </Grid>
  );
}
