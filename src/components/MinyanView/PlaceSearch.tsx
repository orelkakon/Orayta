'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { GeocodeResult } from '@/types/minyan';
import type { Origin } from './useMinyanSearch';
import { Input, GhostBtn, Muted, ErrorText } from './minyanStyles';

const Form = styled.form`display: flex; gap: ${theme.spacing.sm};`;
const Grow = styled(Input)`flex: 1; min-width: 0;`;

const Results = styled.ul`
  display: flex; flex-direction: column; gap: 2px; margin-top: ${theme.spacing.xs};
  list-style: none;
`;

const ResultBtn = styled.button`
  width: 100%; text-align: right; display: flex; align-items: center; gap: ${theme.spacing.sm};
  padding: 10px ${theme.spacing.sm}; border-radius: ${theme.radii.sm};
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.text};
  &:hover, &:focus-visible { background: ${theme.colors.surfaceAlt}; }
  svg { color: ${theme.colors.secondary}; flex-shrink: 0; }
`;

/**
 * Manual location fallback. Submits on Enter / button only — Nominatim's
 * usage policy forbids as-you-type autocomplete against its public API.
 */
export default function PlaceSearch({ onPick }: { onPick: (o: Origin) => void }) {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<GeocodeResult[] | null>(null);
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (query.length < 2 || busy) return;
    setBusy(true); setError(false); setResults(null);
    try {
      const res = await fetch(`/api/minyan/geocode?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json() as GeocodeResult[];
      if (data.length === 1) { onPick(data[0]); setResults(null); }
      else setResults(data);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Form onSubmit={submit} role="search">
        <Grow
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={HE.MN_SEARCH_PLACEHOLDER}
          aria-label={HE.MN_SEARCH_PLACEHOLDER}
          enterKeyHint="search"
        />
        <GhostBtn type="submit" disabled={busy || q.trim().length < 2} aria-label={HE.MN_SEARCH_BTN}>
          {busy ? HE.MN_SEARCHING : <LineIcon name="search" size={18} />}
        </GhostBtn>
      </Form>
      {error && <ErrorText role="alert">{HE.MN_SEARCH_ERROR}</ErrorText>}
      {results && results.length === 0 && <Muted role="status">{HE.MN_SEARCH_NO_RESULTS}</Muted>}
      {results && results.length > 1 && (
        <Results>
          {results.map(r => (
            <li key={`${r.lat},${r.lng}`}>
              <ResultBtn type="button" onClick={() => { onPick(r); setResults(null); }}>
                <LineIcon name="pin" size={16} /> {r.label}
              </ResultBtn>
            </li>
          ))}
        </Results>
      )}
    </div>
  );
}
