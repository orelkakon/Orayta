'use client';

import { Fragment } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { StaticGroup } from '@/lib/prayers/types';

const TextCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`;

const GroupTitle = styled.div`
  font-family: ${theme.fonts.body}; font-size: 1.05rem; font-weight: 700;
  color: ${theme.colors.primary};
  padding: ${theme.spacing.sm} 0 4px;
  border-bottom: 2px solid ${theme.colors.borderLight};
  margin-bottom: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  &:first-child { margin-top: 0; }
`;

const BlessingRow = styled.div`
  display: flex; gap: ${theme.spacing.sm}; align-items: flex-start;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;

const BlessingIcon = styled.span`
  font-size: 1.4rem; flex-shrink: 0; line-height: 1; padding-top: 2px;
`;

const BlessingMeta = styled.div`display: flex; flex-direction: column; gap: 3px;`;

const BlessingLabel = styled.div`
  font-size: 0.8rem; font-weight: 700; color: ${theme.colors.secondary};
`;

const BlessingText = styled.p`
  font-family: ${theme.fonts.body}; font-size: 1.05rem; line-height: 2;
  color: ${theme.colors.text};
`;

export default function StaticGroupsView({ groups }: { groups: StaticGroup[] }) {
  return (
    <TextCard>
      {groups.map((group, gi) => (
        <Fragment key={gi}>
          <GroupTitle>{group.title}</GroupTitle>
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
