'use client';

import { Fragment } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { StaticGroup } from '@/lib/prayers/types';
import { TextCard } from './readerStyles';

const GroupTitle = styled.h3`
  font-family: ${theme.fonts.body}; font-size: calc(1rem * var(--siddur-scale, 1.22)); font-weight: 700;
  color: ${theme.colors.primary};
  padding: ${theme.spacing.sm} 0 6px;
  border-bottom: 1px solid color-mix(in srgb, ${theme.colors.gold} 40%, transparent);
  margin: ${theme.spacing.lg} 0 4px;
  &:first-child { margin-top: 0; }
`;

const GroupExplanation = styled.div`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.secondaryText};
  margin: 6px 0 ${theme.spacing.sm}; line-height: 1.55;
  padding: 0.4em 0.75em; border-radius: 10px;
  background: color-mix(in srgb, ${theme.colors.goldSoft} 70%, transparent);
`;

const BlessingRow = styled.div`
  display: flex; gap: ${theme.spacing.ms}; align-items: flex-start;
  padding: ${theme.spacing.ms} 0;
  & + & { border-top: 1px solid ${theme.colors.borderLight}; }
`;

const BlessingIcon = styled.span`
  font-size: 1.4rem; flex-shrink: 0; line-height: 1; padding-top: 0.35em;
`;

const BlessingMeta = styled.div`display: flex; flex-direction: column; gap: 3px; min-width: 0;`;

const BlessingLabel = styled.div`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondaryText};
`;

const BlessingText = styled.p`
  font-family: ${theme.fonts.body}; font-size: calc(1.05rem * var(--siddur-scale, 1.22)); line-height: 2;
  color: ${theme.colors.text}; white-space: pre-line; text-wrap: pretty;
`;

export default function StaticGroupsView({ groups }: { groups: StaticGroup[] }) {
  return (
    <TextCard>
      {groups.map((group, gi) => (
        <Fragment key={gi}>
          <GroupTitle>{group.title}</GroupTitle>
          {group.explanation && <GroupExplanation>{group.explanation}</GroupExplanation>}
          {group.items.map((item, ii) => (
            <BlessingRow key={ii}>
              {item.icon && <BlessingIcon>{item.icon}</BlessingIcon>}
              <BlessingMeta>
                {item.label && <BlessingLabel>{item.label}</BlessingLabel>}
                <BlessingText>{item.text}</BlessingText>
              </BlessingMeta>
            </BlessingRow>
          ))}
        </Fragment>
      ))}
    </TextCard>
  );
}
