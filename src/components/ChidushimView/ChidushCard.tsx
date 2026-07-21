'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Chidush } from '@/types';
import SpeakButton from '@/components/common/SpeakButton';
import { trackShare } from '@/lib/shareCounter';
import { shareStory, chidushStory } from '@/lib/storyShare';

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.borderLight};
  border-right: 4px solid ${theme.colors.secondary};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  transition: box-shadow 0.15s, transform 0.15s;
  &:hover { box-shadow: ${theme.shadows.md}; transform: translateY(-1px); }
`;

const Text = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1rem;
  line-height: 1.85;
  color: ${theme.colors.text};
  overflow-wrap: break-word;
  word-break: break-word;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  align-items: center;
  border-top: 1px solid ${theme.colors.borderLight};
  padding-top: ${theme.spacing.xs};
`;

const Chip = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.sm};
  padding: 2px ${theme.spacing.sm};
`;

const UnknownSource = styled.span`
  font-size: 0.75rem;
  font-style: italic;
  color: ${theme.colors.textLight};
`;

const ShareBtn = styled.a`
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.75rem; font-weight: 600;
  padding: 2px ${theme.spacing.sm};
  background: #25D36618; color: #128C7E;
  border: 1px solid #25D36630;
  border-radius: ${theme.radii.sm};
  cursor: pointer; text-decoration: none;
  &:hover { background: #25D36630; }
`;

const StoryBtn = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.75rem; font-weight: 600;
  padding: 2px ${theme.spacing.sm};
  background: #E1306C14; color: #C13584;
  border: 1px solid #E1306C30;
  border-radius: ${theme.radii.sm};
  cursor: pointer;
  &:hover { background: #E1306C28; }
`;

const AdminRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
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
  chidush: Chidush;
  onEdit?: () => void;
  onDelete?: () => void;
}

function buildWaUrl(chidush: Chidush): string {
  const lines: string[] = [];
  if (chidush.author) lines.push(`👤 *${chidush.author}*`);
  if (chidush.source) lines.push(`📖 ${chidush.source}`);
  lines.push('');
  lines.push(chidush.text);
  lines.push('');
  lines.push('_שיתוף מאורייתא 📖_');
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join('\n'))}`;
}

export default function ChidushCard({ chidush, onEdit, onDelete }: Props) {
  const hasSource = !!chidush.source;
  const hasAuthor = !!chidush.author;
  const hasMeta = hasSource || hasAuthor;

  return (
    <Card>
      <Text>{chidush.text}</Text>
      <MetaRow>
        <SpeakButton text={chidush.text} />
        {hasAuthor && <Chip>👤 {chidush.author}</Chip>}
        {hasSource && <Chip>📖 {chidush.source}</Chip>}
        {!hasMeta && <UnknownSource>{HE.CHIDUSH_UNKNOWN_SOURCE}</UnknownSource>}
        <ShareBtn href={buildWaUrl(chidush)} target="_blank" rel="noopener noreferrer" onClick={trackShare}>
          💬 {HE.CHIDUSH_SHARE_WA}
        </ShareBtn>
        <StoryBtn onClick={() => shareStory(chidushStory(chidush))}>
          📸 {HE.STORY_SHARE_IG}
        </StoryBtn>
      </MetaRow>
      {(onEdit || onDelete) && (
        <AdminRow>
          {onEdit  && <EditBtn   onClick={onEdit}>{HE.STUDY_EDIT}</EditBtn>}
          {onDelete && <DeleteBtn onClick={onDelete}>{HE.STUDY_DELETE}</DeleteBtn>}
        </AdminRow>
      )}
    </Card>
  );
}
