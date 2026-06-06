'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/rabbisData';

const Card = styled.div<{ $color: string }>`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.borderLight};
  border-right: 4px solid ${({ $color }) => $color};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  transition: box-shadow 0.15s, transform 0.15s;
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-1px);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const Name = styled.h3`
  font-family: ${theme.fonts.body};
  font-size: 1.15rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  line-height: 1.3;
`;

const FullName = styled.div`
  font-size: 0.82rem;
  color: ${theme.colors.textMuted};
  font-style: italic;
`;

const MetaCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${theme.spacing.xs};
  flex-shrink: 0;
  max-width: 55%;
  min-width: 0;
`;

const DateBadge = styled.div<{ $alive: boolean }>`
  font-size: 0.78rem;
  font-weight: 600;
  padding: 2px ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
  direction: ltr;
  white-space: normal;
  word-break: break-word;
  text-align: right;
  background: ${({ $alive }) => ($alive ? theme.colors.bgSuccess : theme.colors.surfaceAlt)};
  color: ${({ $alive }) => ($alive ? theme.colors.success : theme.colors.textMuted)};
  border: 1px solid ${({ $alive }) => ($alive ? '#A5D6A7' : theme.colors.borderLight)};
`;

const AliveDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${theme.colors.success};
  margin-left: 4px;
  vertical-align: middle;
`;

const CategoryBadge = styled.div<{ $color: string }>`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
  padding: 1px ${theme.spacing.xs};
  border-radius: ${theme.radii.sm};
  border: 1px solid ${({ $color }) => $color}33;
  background: ${({ $color }) => $color}11;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.borderLight};
  margin: ${theme.spacing.xs} 0;
`;

const Bio = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 0.92rem;
  line-height: 1.75;
  color: ${theme.colors.text};
  overflow-wrap: break-word;
  word-break: break-word;
`;

const AdminRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  justify-content: flex-start;
  margin-top: ${theme.spacing.xs};
`;

const EditBtn = styled.button`
  font-size: 0.75rem; padding: 2px ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.sm};
  color: ${theme.colors.textMuted}; transition: all 0.15s;
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;
const DeleteBtn = styled.button`
  font-size: 0.75rem; padding: 2px ${theme.spacing.sm};
  border: 1px solid ${theme.colors.error}33; border-radius: ${theme.radii.sm};
  color: ${theme.colors.error}; opacity: 0.7; transition: opacity 0.15s;
  &:hover { opacity: 1; background: rgba(155,35,53,0.06); }
`;

interface Props {
  rabbi: Rabbi;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function RabbiCard({ rabbi, onEdit, onDelete }: Props) {
  const color = CATEGORY_COLORS[rabbi.category as RabbiCategory] ?? theme.colors.primaryLight;
  const label = CATEGORY_LABELS[rabbi.category as RabbiCategory] ?? rabbi.category;

  return (
    <Card $color={color}>
      <Header>
        <NameBlock>
          <Name>{rabbi.name}</Name>
          {rabbi.fullName && <FullName>{rabbi.fullName}</FullName>}
        </NameBlock>
        <MetaCol>
          <DateBadge $alive={rabbi.isAlive}>
            {rabbi.datePeriod}
            {rabbi.isAlive && <AliveDot />}
          </DateBadge>
          <CategoryBadge $color={color}>{label}</CategoryBadge>
        </MetaCol>
      </Header>
      <Divider />
      <Bio>{rabbi.bio}</Bio>
      {(onEdit || onDelete) && (
        <AdminRow>
          {onEdit && <EditBtn onClick={onEdit}>{HE.STUDY_EDIT}</EditBtn>}
          {onDelete && <DeleteBtn onClick={onDelete}>{HE.STUDY_DELETE}</DeleteBtn>}
        </AdminRow>
      )}
    </Card>
  );
}
