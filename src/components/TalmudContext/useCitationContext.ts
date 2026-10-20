'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AmudRef, AmudSide } from '@/types/talmudContext';
import { tractateFor, parseDaf, parseAmud } from '@/lib/talmud/tractates';
import { findCitationSegment } from '@/lib/talmud/contextMatch';
import { loadTalmudPage, useTalmudPage } from './useTalmudPage';

export interface ContextLocationInput { masechet: string; daf: string; amud?: string | null }
export interface ContextCitation { content: string; locations: ContextLocationInput[] }

export interface ContextLocation { masechet: string; daf: number; amud: AmudSide | null }

/** The citation's locations that can be opened on Sefaria (known tractate, parseable daf). */
export function contextLocations(locations: ContextLocationInput[]): ContextLocation[] {
  return locations.flatMap(l => {
    const daf = parseDaf(l.daf);
    return tractateFor(l.masechet) && daf !== null
      ? [{ masechet: l.masechet.trim(), daf, amud: parseAmud(l.amud) }]
      : [];
  });
}

const startOf = (loc: ContextLocation): AmudRef => ({ daf: loc.daf, amud: loc.amud ?? 'a' });

/**
 * Drives the context sheet: which location and amud is shown, and where on
 * it the citation probably sits. A location without an amud starts on א and
 * moves to ב when only ב contains the citation.
 */
export function useCitationContext(citation: ContextCitation) {
  const locs = useMemo(() => contextLocations(citation.locations), [citation.locations]);
  const [locIndex, setLocIndex] = useState(0);
  const loc = locs[Math.min(locIndex, locs.length - 1)];
  const [at, setAt] = useState<AmudRef>(() => startOf(loc));
  // Callers may rebuild the locations array every render — key effects on values, not identity.
  const locKey = `${loc.masechet}|${loc.daf}|${loc.amud ?? ''}`;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setAt(startOf(loc)); }, [locKey]);

  useEffect(() => {
    if (loc.amud) return;
    let alive = true;
    const sides: AmudSide[] = ['a', 'b'];
    Promise.all(sides.map(amud => loadTalmudPage(loc.masechet, { daf: loc.daf, amud }).catch(() => null)))
      .then(([a, b]) => {
        if (!alive || !b) return;
        const onA = a && findCitationSegment(citation.content, a.segments);
        const onB = findCitationSegment(citation.content, b.segments);
        // Only move if the reader hasn't navigated away from the starting amud meanwhile.
        if (!onA && onB) setAt(prev => (prev.daf === loc.daf && prev.amud === 'a' ? { daf: loc.daf, amud: 'b' } : prev));
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locKey, citation.content]);

  const { state, retry } = useTalmudPage(loc.masechet, at);
  const isOwnPage = at.daf === loc.daf && (!loc.amud || at.amud === loc.amud);
  const match = useMemo(
    () => (state.status === 'ready' && isOwnPage ? findCitationSegment(citation.content, state.page.segments) : null),
    [state, isOwnPage, citation.content],
  );

  return { locs, locIndex, setLocIndex, loc, at, setAt, state, retry, match, isOwnPage };
}
