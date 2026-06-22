'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Citation } from '@/types';
import SpeakButton from '@/components/common/SpeakButton';

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: ${theme.shadows.md};
  }
`;

const Content = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1.05rem;
  line-height: 1.8;
  color: ${theme.colors.text};
`;

const Locations = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const LocationTag = styled.span`
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: 2px ${theme.spacing.sm};
  font-size: 0.8rem;
  color: ${theme.colors.textMuted};
  font-family: ${theme.fonts.body};
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
  border-top: 1px solid ${theme.colors.borderLight};
  padding-top: ${theme.spacing.sm};
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
  font-size: 0.8rem;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  font-weight: 500;
  transition: all 0.15s;
  color: ${({ $variant }) => ($variant === 'danger' ? theme.colors.error : theme.colors.primaryLight)};
  border: 1px solid ${({ $variant }) => ($variant === 'danger' ? theme.colors.error : theme.colors.border)};

  &:hover {
    background: ${({ $variant }) =>
      $variant === 'danger' ? 'rgba(155,35,53,0.08)' : 'rgba(92,61,30,0.08)'};
  }
`;

const ConfirmOverlay = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 0.85rem;
  color: ${theme.colors.error};
  flex-wrap: wrap;
`;

interface Props {
  citation: Citation;
  onEdit: (citation: Citation) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

function formatLocation(loc: Citation['locations'][0]) {
  let label = `${loc.masechet} ${loc.daf}`;
  if (loc.amud) label += ` ${loc.amud}`;
  return label;
}

export default function CitationCard({ citation, onEdit, onDelete, isReadOnly = false }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card>
      <Content>{citation.content}</Content>
      <Locations>
        {citation.locations.map((loc) => (
          <LocationTag key={loc.id}>{formatLocation(loc)}</LocationTag>
        ))}
      </Locations>
      <Actions>
        <SpeakButton text={`${citation.content}. ${citation.locations.map(formatLocation).join(', ')}`} />
        {!isReadOnly && !confirming && (
          <>
            <ActionButton onClick={() => onEdit(citation)}>{HE.STUDY_EDIT}</ActionButton>
            <ActionButton $variant="danger" onClick={() => setConfirming(true)}>{HE.STUDY_DELETE}</ActionButton>
          </>
        )}
        {!isReadOnly && confirming && (
          <ConfirmOverlay>
            <span>{HE.DELETE_CONFIRM}</span>
            <ActionButton $variant="danger" onClick={() => onDelete(citation.id)}>כן, מחק</ActionButton>
            <ActionButton onClick={() => setConfirming(false)}>{HE.CANCEL}</ActionButton>
          </ConfirmOverlay>
        )}
      </Actions>
    </Card>
  );
}
