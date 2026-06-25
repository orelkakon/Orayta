'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/rabbisData';
import SpeakButton from '@/components/common/SpeakButton';

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

const YahrzeitLine = styled.div`
  font-size: 0.72rem;
  color: ${theme.colors.textLight};
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 1px;
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

const BooksSection = styled.div`
  border-top: 1px solid ${theme.colors.borderLight};
  margin-top: ${theme.spacing.xs};
  padding-top: ${theme.spacing.xs};
`;

const BooksToggle = styled.button`
  font-size: 0.78rem;
  color: ${theme.colors.textMuted};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s;
  &:hover { color: ${theme.colors.primary}; }
`;

const BooksList = styled.ul`
  list-style: none;
  margin-top: ${theme.spacing.xs};
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BookItem = styled.li`
  font-size: 0.8rem;
  color: ${theme.colors.text};
  padding-right: ${theme.spacing.sm};
  &::before { content: '📖 '; }
`;

const AdminRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  justify-content: flex-start;
  margin-top: ${theme.spacing.xs};
`;

const PhotoBtn = styled.button<{ $color: string }>`
  font-size: 0.75rem;
  padding: 3px ${theme.spacing.sm};
  border: 1.5px solid ${({ $color }) => $color}55;
  border-radius: ${theme.radii.sm};
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}0D;
  font-weight: 600;
  transition: all 0.15s;
  display: flex; align-items: center; gap: 4px;
  &:hover { background: ${({ $color }) => $color}20; border-color: ${({ $color }) => $color}; }
`;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const zoomIn = keyframes`from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); }`;

const LightboxOverlay = styled.div`
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  padding: ${theme.spacing.md};
  animation: ${fadeIn} 0.2s ease;
  cursor: zoom-out;
`;

const LightboxImg = styled.img`
  max-width: min(90vw, 560px);
  max-height: 82vh;
  border-radius: ${theme.radii.lg};
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  object-fit: contain;
  animation: ${zoomIn} 0.25s ease;
  cursor: default;
`;

const LightboxCaption = styled.div`
  position: fixed; bottom: ${theme.spacing.xl};
  left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
  color: white; padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: 24px; font-size: 1rem; font-weight: 600;
  white-space: nowrap;
`;

const LightboxClose = styled.button`
  position: fixed; top: ${theme.spacing.lg}; left: ${theme.spacing.lg};
  background: rgba(0,0,0,0.5); color: white;
  width: 36px; height: 36px; border-radius: 50%;
  font-size: 1.2rem; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.2); }
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

interface BookRef { id: string; title: string; }

interface Props {
  rabbi: Rabbi;
  books?: BookRef[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function RabbiCard({ rabbi, books, onEdit, onDelete }: Props) {
  const [booksOpen, setBooksOpen] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const color = CATEGORY_COLORS[rabbi.category as RabbiCategory] ?? theme.colors.primaryLight;
  const label = CATEGORY_LABELS[rabbi.category as RabbiCategory] ?? rabbi.category;

  return (
    <>
    <Card $color={color}>
      <Header>
        <NameBlock>
          <Name>{rabbi.name}</Name>
          {rabbi.fullName && <FullName>{rabbi.fullName}</FullName>}
          {rabbi.deathDate && (
            <YahrzeitLine>
              <span>🕯</span>
              <span>{rabbi.deathDate}</span>
            </YahrzeitLine>
          )}
        </NameBlock>
        <MetaCol>
          <DateBadge $alive={rabbi.isAlive}>
            {rabbi.datePeriod}
            {rabbi.isAlive && <AliveDot />}
          </DateBadge>
          <CategoryBadge $color={color}>{label}</CategoryBadge>
          {rabbi.imageUrl && (
            <PhotoBtn $color={color} onClick={() => setLightbox(true)}>
              🖼 תמונה
            </PhotoBtn>
          )}
        </MetaCol>
      </Header>
      <Divider />
      <Bio>{rabbi.bio}</Bio>
      <SpeakButton text={`${rabbi.name}. ${rabbi.bio}`} />
      {books && books.length > 0 && (
        <BooksSection>
          <BooksToggle onClick={() => setBooksOpen(o => !o)}>
            📚 {HE.RABBI_BOOKS_SECTION} ({books.length}) {booksOpen ? '▲' : '▼'}
          </BooksToggle>
          {booksOpen && (
            <BooksList>
              {books.map(b => <BookItem key={b.id}>{b.title}</BookItem>)}
            </BooksList>
          )}
        </BooksSection>
      )}
      {(onEdit || onDelete) && (
        <AdminRow>
          {onEdit && <EditBtn onClick={onEdit}>{HE.STUDY_EDIT}</EditBtn>}
          {onDelete && <DeleteBtn onClick={onDelete}>{HE.STUDY_DELETE}</DeleteBtn>}
        </AdminRow>
      )}
    </Card>

    {lightbox && rabbi.imageUrl && (
      <LightboxOverlay onClick={() => setLightbox(false)}>
        <LightboxImg src={rabbi.imageUrl} alt={rabbi.name} onClick={e => e.stopPropagation()} />
        <LightboxCaption>{rabbi.name}</LightboxCaption>
        <LightboxClose onClick={() => setLightbox(false)}>×</LightboxClose>
      </LightboxOverlay>
    )}
  </>
  );
}
