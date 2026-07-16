'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { SikumEntry } from '@/types';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${theme.spacing.sm};
`;

const Cube = styled.button`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; text-align: center; cursor: pointer;
  box-shadow: ${theme.shadows.sm};
  transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
  &:hover {
    box-shadow: ${theme.shadows.md}; transform: translateY(-2px);
    border-color: ${theme.colors.secondary};
  }
`;

const CubeDate = styled.span`
  font-size: 0.7rem; font-weight: 700;
  padding: 2px 9px; border-radius: 9999px;
  background: ${theme.colors.primary}18;
  color: ${theme.colors.primary};
  border: 1px solid ${theme.colors.primary}30;
`;

const CubeTitle = styled.div`
  font-size: 0.86rem; font-weight: 700; color: ${theme.colors.text};
  line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Untitled = styled(CubeTitle)`
  font-weight: 400; color: ${theme.colors.textMuted};
`;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
}
function dateLabel(date: string, dateEnd: string | null) {
  return dateEnd ? `${formatDate(date)} – ${formatDate(dateEnd)}` : formatDate(date);
}

interface Props {
  entries: SikumEntry[];
  onOpen: (entry: SikumEntry) => void;
}

export default function SikumCubesGrid({ entries, onOpen }: Props) {
  return (
    <Grid>
      {entries.map(e => (
        <Cube key={e.id} onClick={() => onOpen(e)}>
          <CubeDate>{dateLabel(e.date, e.dateEnd)}</CubeDate>
          {e.title
            ? <CubeTitle>{e.title}</CubeTitle>
            : <Untitled>{e.text.slice(0, 40)}…</Untitled>
          }
        </Cube>
      ))}
    </Grid>
  );
}
