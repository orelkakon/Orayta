'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SEDARIM, MASECHTOT } from '@/lib/hebrewData';
import { Citation } from '@/types';
import CitationCard from '@/components/CitationCard/CitationCard';
import Modal from '@/components/common/Modal';
import CitationForm from '@/components/CitationForm/CitationForm';
import RandomCitationModal from '@/components/StudyView/RandomCitationModal';
import { useRole } from '@/components/common/RoleContext';
import SearchField from '@/components/common/SearchField';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${theme.colors.primary};
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const FilterRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  flex: 1;
  min-width: 160px;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.9rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${theme.colors.primaryLight};
  }
`;

const SearchWrap = styled.div`
  flex: 2;
  min-width: 200px;
`;

const CountBadge = styled.div`
  font-size: 0.82rem;
  color: ${theme.colors.textMuted};
  text-align: left;
`;

const CitationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Empty = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.textMuted};
  font-size: 1rem;
`;

export default function StudyView({ initialMasechet = '' }: { initialMasechet?: string }) {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [seder, setSeder] = useState('');
  const [masechet, setMasechet] = useState(initialMasechet);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Citation | null>(null);
  const [loading, setLoading] = useState(true);
  const role = useRole();
  const isReadOnly = role !== 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (masechet) params.set('masechet', masechet);
    else if (seder) params.set('seder', seder);
    if (search) params.set('search', search);

    const res = await fetch(`/api/citations?${params}`);
    const data = await res.json() as Citation[];
    setCitations(data);
    setLoading(false);
  }, [masechet, seder, search]);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/citations/${id}`, { method: 'DELETE' });
    void load();
  };

  const handleEdit = async (data: { content: string; locations: { masechet: string; daf: string; amud: string | null }[] }) => {
    if (!editing) return;
    await fetch(`/api/citations/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditing(null);
    void load();
  };

  const masechtotForSeder = seder
    ? MASECHTOT.filter((m) => m.seder === seder).map((m) => m.name)
    : MASECHTOT.map((m) => m.name);

  return (
    <Container>
      <TitleRow>
        <Title>{HE.STUDY_TITLE}</Title>
        <RandomCitationModal masechet={masechet} seder={seder} search={search} />
      </TitleRow>

      <FilterSection>
        <FilterRow>
          <FilterField>
            <FilterLabel>{HE.STUDY_FILTER_SEDER}</FilterLabel>
            <Select value={seder} onChange={(e) => { setSeder(e.target.value); setMasechet(''); }}>
              <option value="">{HE.STUDY_FILTER_ALL}</option>
              {SEDARIM.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FilterField>

          <FilterField>
            <FilterLabel>{HE.STUDY_FILTER_MASECHET}</FilterLabel>
            <Select value={masechet} onChange={(e) => setMasechet(e.target.value)}>
              <option value="">{HE.STUDY_FILTER_ALL}</option>
              {masechtotForSeder.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </FilterField>

          <SearchWrap>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder={HE.STUDY_SEARCH_PLACEHOLDER}
            />
          </SearchWrap>
        </FilterRow>
        {!loading && <CountBadge>{HE.STUDY_COUNT(citations.length)}</CountBadge>}
      </FilterSection>

      <CitationList>
        {loading ? (
          <Empty>{HE.LOADING}</Empty>
        ) : citations.length === 0 ? (
          <Empty>{HE.STUDY_EMPTY}</Empty>
        ) : (
          citations.map((c) => (
            <CitationCard key={c.id} citation={c} onEdit={setEditing} onDelete={handleDelete} isReadOnly={isReadOnly} />
          ))
        )}
      </CitationList>

      {editing && (
        <Modal title={HE.EDIT_TITLE} onClose={() => setEditing(null)}>
          <CitationForm initial={editing} onSave={handleEdit} submitLabel={HE.EDIT_SUBMIT} />
        </Modal>
      )}
    </Container>
  );
}
