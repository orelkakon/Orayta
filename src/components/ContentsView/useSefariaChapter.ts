import { useEffect, useState } from 'react';

interface SefariaResp { he: string[]; heRef?: string; }

export interface SefariaChapter { verses: string[]; refLabel: string; loading: boolean; }

// Fetch one Sefaria text ref (e.g. "Psalms.16"). Pass null to skip fetching.
export function useSefariaChapter(ref: string | null): SefariaChapter {
  const [verses, setVerses] = useState<string[]>([]);
  const [refLabel, setRefLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ref) { setVerses([]); setRefLabel(''); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`https://www.sefaria.org/api/texts/${ref}?lang=he`)
      .then(r => r.json())
      .then((d: SefariaResp) => {
        if (cancelled) return;
        setVerses(d.he ?? []);
        setRefLabel(d.heRef ?? '');
      })
      .catch(() => { if (!cancelled) setVerses([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ref]);

  return { verses, refLabel, loading };
}
