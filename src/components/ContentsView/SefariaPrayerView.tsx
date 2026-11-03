'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { sanitizeSiddurHtml } from '@/lib/siddur/sanitize';
import type { SiddurJump } from '@/lib/prayers/types';
import { LineIcon } from '@/components/common/LineIcons';
import { Button } from '@/components/ui/Button';
import { SkeletonText } from '@/components/ui/Skeleton';
import ReadingText from '@/components/Reader/ReadingText';

/**
 * A prayer fetched from Sefaria and read in the shared prayer typography.
 * Sefaria's HTML is sanitized to presentational tags before it is rendered
 * (same rules as the siddur API).
 */
interface SefariaResp { he?: string[] }

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Jump = styled(Button)`align-self: flex-start;`;

const State = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xl} ${theme.spacing.md}; text-align: center; color: ${theme.colors.textMuted};
`;

const Loading = styled.div`display: flex; flex-direction: column; gap: 22px; padding-top: ${theme.spacing.sm};`;

function toUrl(ref: string): string {
  return ref.replace(/, /g, '%2C_');
}

// Strip tags + nikud/cantillation so jump matching works on plain letters.
function toPlainLetters(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/[֑-ׇ]/g, '');
}

interface Props { sefariaRef: string; jump?: SiddurJump }

export default function SefariaPrayerView({ sefariaRef, jump }: Props) {
  const [paragraphs, setParagraphs] = useState<string[] | null>(null);
  const [error, setError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setError(false);
    setParagraphs(null);
    // context=0: a segment-range ref returns only the requested range.
    fetch(`https://www.sefaria.org/api/texts/${toUrl(sefariaRef)}?lang=he&context=0`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: SefariaResp) => {
        const items = (d.he ?? []).map(sanitizeSiddurHtml).filter(Boolean);
        if (items.length === 0) setError(true);
        setParagraphs(items);
      })
      .catch(() => setError(true));
  }, [sefariaRef]);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <State role="alert">
        <span>{HE.SIDDUR_LOAD_ERROR}</span>
        <Button $size="sm" onClick={load}>{HE.SIDDUR_RETRY}</Button>
      </State>
    );
  }

  if (!paragraphs) {
    return (
      <Loading aria-busy="true" aria-label={HE.LOADING}>
        <SkeletonText lines={4} lineHeight="18px" />
        <SkeletonText lines={5} lineHeight="18px" />
      </Loading>
    );
  }

  const jumpIdx = jump ? paragraphs.findIndex(p => toPlainLetters(p).includes(jump.match)) : -1;
  const doJump = () => {
    rootRef.current?.querySelector(`[data-para="${jumpIdx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Wrap ref={rootRef}>
      {jump && jumpIdx >= 0 && (
        <Jump $variant="tonal" $size="sm" onClick={doJump}>
          {jump.label}<LineIcon name="chevronDown" size={16} strokeWidth={2.2} />
        </Jump>
      )}
      <div><ReadingText paragraphs={paragraphs} /></div>
    </Wrap>
  );
}
