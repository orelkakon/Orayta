'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Citation } from '@/types';
import SpeakButton from '@/components/common/SpeakButton';
import { LineIcon } from '@/components/common/LineIcons';
import ContextButton from '@/components/TalmudContext/ContextButton';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Card = styled.div<{ $index: number }>`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  transition: transform 0.15s ease, box-shadow 0.15s;
  animation: ${fadeUp} 0.45s ease both;
  animation-delay: ${p => Math.min(p.$index, 12) * 40}ms;

  @media (hover: hover) {
    &:hover {
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
    }
  }
  &:active { transform: translateY(-1px) scale(0.98); }
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

/* Footer: study actions (everyone) on the start side, admin tools on the end side. */
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  border-top: 1px solid ${theme.colors.borderLight};
  padding-top: ${theme.spacing.sm};
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const AdminGroup = styled(Group)`
  margin-inline-start: auto;
  padding-inline-start: ${theme.spacing.sm};
  border-inline-start: 1px solid ${theme.colors.borderLight};
`;

const IconBtn = styled.button<{ $danger?: boolean }>`
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid transparent;
  color: ${theme.colors.textMuted};
  transition: background ${theme.motion.fast}, color ${theme.motion.fast}, border-color ${theme.motion.fast};
  &:hover {
    color: ${({ $danger }) => ($danger ? theme.colors.error : theme.colors.primary)};
    border-color: ${({ $danger }) => ($danger ? theme.colors.error : theme.colors.border)};
    background: ${({ $danger }) => ($danger ? theme.colors.bgError : theme.colors.surfaceAlt)};
  }
  &:focus-visible { outline: 2px solid ${theme.colors.primaryLight}; outline-offset: 2px; }
`;

const Confirm = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  margin-inline-start: auto;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${theme.colors.error};
`;

const TextBtn = styled.button<{ $danger?: boolean }>`
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  color: ${({ $danger }) => ($danger ? theme.colors.onPrimary : theme.colors.textMuted)};
  background: ${({ $danger }) => ($danger ? theme.colors.error : 'transparent')};
  border: 1px solid ${({ $danger }) => ($danger ? theme.colors.error : theme.colors.border)};
`;

interface Props {
  citation: Citation;
  index?: number;
  onEdit: (citation: Citation) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

function formatLocation(loc: Citation['locations'][0]) {
  let label = `${loc.masechet} ${loc.daf}`;
  if (loc.amud) label += ` ${loc.amud}`;
  return label;
}

export default function CitationCard({ citation, index = 0, onEdit, onDelete, isReadOnly = false }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card $index={index}>
      <Content>{citation.content}</Content>
      <Locations>
        {citation.locations.map((loc) => (
          <LocationTag key={loc.id}>{formatLocation(loc)}</LocationTag>
        ))}
      </Locations>
      <Footer>
        <Group>
          <ContextButton citation={citation} />
          <SpeakButton variant="icon" text={`${citation.content}. ${citation.locations.map(formatLocation).join(', ')}`} />
        </Group>
        {!isReadOnly && !confirming && (
          <AdminGroup>
            <IconBtn type="button" onClick={() => onEdit(citation)} title={HE.STUDY_EDIT} aria-label={HE.STUDY_EDIT}>
              <LineIcon name="pencil" size={16} strokeWidth={1.8} />
            </IconBtn>
            <IconBtn type="button" $danger onClick={() => setConfirming(true)} title={HE.STUDY_DELETE} aria-label={HE.STUDY_DELETE}>
              <LineIcon name="trash" size={16} strokeWidth={1.8} />
            </IconBtn>
          </AdminGroup>
        )}
        {!isReadOnly && confirming && (
          <Confirm role="alert">
            <span>{HE.STUDY_DELETE_ASK}</span>
            <TextBtn type="button" $danger onClick={() => onDelete(citation.id)}>{HE.STUDY_DELETE_YES}</TextBtn>
            <TextBtn type="button" onClick={() => setConfirming(false)}>{HE.CANCEL}</TextBtn>
          </Confirm>
        )}
      </Footer>
    </Card>
  );
}
