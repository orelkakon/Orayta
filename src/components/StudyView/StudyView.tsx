'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import PageHeader from '@/components/ui/PageHeader';
import SearchField from '@/components/common/SearchField';
import ListState from '@/components/common/ListState';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const StickyBar = styled.div`
  position: sticky; top: var(--header-h, 56px); z-index: ${theme.z.sticky};
  margin: 0 calc(-1 * ${theme.layout.gutter});
  padding: ${theme.spacing.sm} ${theme.layout.gutter};
  background: ${theme.colors.background};
  background: color-mix(in srgb, ${theme.colors.background} 92%, transparent);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  display: flex; flex-direction: column; gap: 6px;
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


const CountBadge = styled.div`
  font-size: 0.82rem;
  color: ${theme.colors.textMuted};
  text-align: left;
`;

/* Refetches (search keystrokes, filter changes) dim the existing results
   instead of unmounting them — the page keeps its height and the user keeps
   their place. Only the very first load shows a placeholder. */
const CitationList = styled.div<{ $stale: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  opacity: ${({ $stale }) => ($stale ? 0.45 : 1)};
  pointer-events: ${({ $stale }) => ($stale ? 'none' : 'auto')};
  transition: opacity ${theme.motion.base} ease;
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
  const [loadError, setLoadError] = useState(false);
  const hasLoaded = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const role = useRole();
  const isReadOnly = role !== 'admin';

  const load = useCallback(async () => {
    // Abort the in-flight request so fast typing can't land out of order.
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setLoadError(false);
    try {
      const params = new URLSearchParams();
      if (masechet) params.set('masechet', masechet);
      else if (seder) params.set('seder', seder);
      if (search) params.set('search', search);

      const res = await fetch(`/api/citations?${params}`, { signal: ctrl.signal });
      const data = await res.json() as Citation[];
      setCitations(data);
      hasLoaded.current = true;
      setLoading(false);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setLoadError(true);
      setLoading(false);
    }
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
      <PageHeader
        icon="openbook"
        title={HE.STUDY_TITLE}
        actions={<RandomCitationModal masechet={masechet} seder={seder} search={search} />}
      />
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

          </FilterRow>
      </FilterSection>
      <StickyBar>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={HE.STUDY_SEARCH_PLACEHOLDER}
        />
        {hasLoaded.current && !loadError && <CountBadge>{HE.STUDY_COUNT(citations.length)}</CountBadge>}
      </StickyBar>

      <CitationList $stale={loading && hasLoaded.current}>
        {loadError || !hasLoaded.current ? (
          <ListState loading={loading} error={loadError} emptyText={HE.STUDY_EMPTY} onRetry={() => void load()} />
        ) : citations.length === 0 && !loading ? (
          <Empty>{search ? HE.SEARCH_NO_RESULTS : HE.STUDY_EMPTY}</Empty>
        ) : (
          citations.map((c, i) => (
            <CitationCard key={c.id} citation={c} index={i} onEdit={setEditing} onDelete={handleDelete} isReadOnly={isReadOnly} />
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
