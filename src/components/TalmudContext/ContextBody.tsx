'use client';

import { useEffect, useRef } from 'react';
import { HE } from '@/lib/hebrewTexts';
import type { ContextMatch } from '@/types/talmudContext';
import type { PageState } from './useTalmudPage';
import {
  Body, Segment, HitLabel, Note, SkeletonLine, StateBox, IconBtn,
} from './sheetStyles';

export type TextMode = 'source' | 'explained';

interface Props {
  state: PageState;
  mode: TextMode;
  scale: number;
  match: ContextMatch | null;
  showNoMatch: boolean;
  jumpSignal: number;
  onRetry: () => void;
}

const SKELETON = [96, 88, 92, 70, 94, 84, 60];

/** The scrolling text of one amud: skeleton → error → segments with the citation highlighted. */
export default function ContextBody({ state, mode, scale, match, showNoMatch, jumpSignal, onRetry }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLParagraphElement>(null);
  const page = state.status === 'ready' ? state.page : null;

  // New page → back to the top, or straight to the citation when we found it.
  useEffect(() => {
    if (!page) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hitRef.current) hitRef.current.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    else bodyRef.current?.scrollTo({ top: 0 });
  }, [page, match, jumpSignal]);

  if (state.status === 'loading') {
    return (
      <Body ref={bodyRef} role="status" aria-label={HE.TC_LOADING} aria-busy="true">
        {SKELETON.map((w, i) => <SkeletonLine key={i} $w={w} />)}
      </Body>
    );
  }

  if (state.status === 'error') {
    return (
      <Body ref={bodyRef}>
        <StateBox role="alert">
          <span>{state.notFound ? HE.TC_NOT_FOUND : HE.TC_ERROR}</span>
          {!state.notFound && <IconBtn onClick={onRetry}>{HE.TC_RETRY}</IconBtn>}
        </StateBox>
      </Body>
    );
  }

  const explained = mode === 'explained' && state.page.segments.some(s => s.ex);
  return (
    <Body ref={bodyRef}>
      {mode === 'explained' && !explained && <Note>{HE.TC_NO_EXPLANATION}</Note>}
      {showNoMatch && <Note>{HE.TC_NO_MATCH}</Note>}
      {state.page.segments.map((s, i) => {
        const hit = match?.index === i;
        const html = explained && s.ex ? s.ex : s.he;
        return (
          <Segment key={i} ref={hit ? hitRef : undefined} $scale={scale} $hit={hit}>
            {hit && <HitLabel>{HE.TC_MATCH_LABEL}</HitLabel>}
            {/* Sanitized server-side to presentational tags only (sanitizeSiddurHtml). */}
            <span dangerouslySetInnerHTML={{ __html: html }} />
          </Segment>
        );
      })}
    </Body>
  );
}
