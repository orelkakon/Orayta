'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Gematria } from '@/types';
import GematriaCard from './GematriaCard';

const Group = styled.div`
  grid-column: 1 / -1;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  border-right: 3px solid ${theme.colors.accent};
  background: ${theme.colors.surfaceAlt};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const ValueLabel = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${theme.colors.accent};
`;

const EqualChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: 2px ${theme.spacing.sm};
`;

const WordCount = styled.span`
  font-size: 0.78rem;
  color: ${theme.colors.textLight};
`;

const Cards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  & > * { min-width: 110px; flex: 0 0 auto; }
`;

interface Props {
  value: number;
  items: Gematria[];
  onEdit?: (g: Gematria) => void;
  onDelete?: (g: Gematria) => void;
}

export default function GematriaConnectionGroup({ value, items, onEdit, onDelete }: Props) {
  return (
    <Group>
      <Header>
        <ValueLabel>= {value}</ValueLabel>
        <EqualChip>🔗 {HE.GEMATRIA_EQUAL_LABEL}</EqualChip>
        <WordCount>× {items.length}</WordCount>
      </Header>
      <Cards>
        {items.map(g => (
          <GematriaCard
            key={g.id}
            gematria={g}
            hideValue
            onEdit={onEdit ? () => onEdit(g) : undefined}
            onDelete={onDelete ? () => onDelete(g) : undefined}
          />
        ))}
      </Cards>
    </Group>
  );
}
