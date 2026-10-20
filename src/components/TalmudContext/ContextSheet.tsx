'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HE } from '@/lib/hebrewTexts';
import { hebrewAmudLabel } from '@/lib/talmud/tractates';
import { toHebrewNumeral } from '@/lib/hebrewNumerals';
import { LineIcon } from '@/components/common/LineIcons';
import { useSiddurFont } from '@/components/SiddurView/useSiddurFont';
import { useCitationContext, type ContextCitation } from './useCitationContext';
import { useDialog } from './useDialog';
import ContextBody, { type TextMode } from './ContextBody';
import {
  EXIT_MS, Backdrop, Sheet, Grip, Head, TitleRow, Title, IconBtn, Quote, ToolRow,
  Segmented, SegBtn, Spacer, Foot, NavRow, SefariaLink, Attribution,
} from './sheetStyles';

const MODE_KEY = 'orayta_tc_mode';

interface Props { citation: ContextCitation; onClose: () => void }

// Events from a portal still bubble through the React tree — keep taps and
// swipes inside the sheet from reaching a feed slide (double-tap = like).
const stop = (e: React.SyntheticEvent) => e.stopPropagation();

/** "הצג בהקשר" reader: the citation's amud from Sefaria, with the citation highlighted when found. */
export default function ContextSheet({ citation, onClose }: Props) {
  const ctx = useCitationContext(citation);
  const font = useSiddurFont();
  const [mode, setMode] = useState<TextMode>('explained');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [jump, setJump] = useState(0);
  const [out, setOut] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { if (localStorage.getItem(MODE_KEY) === 'source') setMode('source'); } catch {}
  }, []);

  const pickMode = (m: TextMode) => {
    setMode(m);
    try { localStorage.setItem(MODE_KEY, m); } catch {}
  };

  // Stable across parent re-renders, so the dialog effect (focus, scroll lock) runs once.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const close = useCallback(() => {
    setOut(true);
    setTimeout(() => onCloseRef.current(), EXIT_MS);
  }, []);
  useDialog(sheetRef, close);

  const where = hebrewAmudLabel(ctx.loc.masechet, ctx.at);
  const page = ctx.state.status === 'ready' ? ctx.state.page : null;

  return createPortal(
    <div onClick={stop} onPointerDown={stop} onTouchStart={stop} onTouchMove={stop} onWheel={stop}>
      <Backdrop $out={out} onClick={close} />
      <Sheet ref={sheetRef} $out={out} role="dialog" aria-modal="true" aria-label={HE.TC_DIALOG_ARIA(where)} tabIndex={-1}>
        <Grip />
        <Head>
          <TitleRow>
            <Title><LineIcon name="openbook" size={20} />{where}</Title>
            <IconBtn onClick={close} aria-label={HE.TC_CLOSE}><LineIcon name="close" size={16} strokeWidth={2} /></IconBtn>
          </TitleRow>

          {ctx.locs.length > 1 && (
            <Segmented role="group" aria-label={HE.TC_LOCATIONS_ARIA}>
              {ctx.locs.map((l, i) => (
                <SegBtn key={i} $on={i === ctx.locIndex} aria-pressed={i === ctx.locIndex} onClick={() => ctx.setLocIndex(i)}>
                  {l.masechet} {toHebrewNumeral(l.daf)}
                </SegBtn>
              ))}
            </Segmented>
          )}

          <Quote $open={quoteOpen} onClick={() => setQuoteOpen(o => !o)} aria-expanded={quoteOpen}>
            {citation.content}
          </Quote>

          <ToolRow>
            <Segmented role="group" aria-label={HE.TC_MODE_ARIA}>
              <SegBtn $on={mode === 'explained'} aria-pressed={mode === 'explained'} onClick={() => pickMode('explained')}>{HE.TC_EXPLAINED}</SegBtn>
              <SegBtn $on={mode === 'source'} aria-pressed={mode === 'source'} onClick={() => pickMode('source')}>{HE.TC_SOURCE}</SegBtn>
            </Segmented>
            <Spacer />
            {ctx.match && <IconBtn onClick={() => setJump(j => j + 1)}>{HE.TC_JUMP}</IconBtn>}
            <IconBtn onClick={font.smaller} disabled={!font.canShrink} aria-label={HE.TC_FONT_SMALLER}>א-</IconBtn>
            <IconBtn onClick={font.larger} disabled={!font.canGrow} aria-label={HE.TC_FONT_LARGER}>א+</IconBtn>
          </ToolRow>
        </Head>

        <ContextBody
          state={ctx.state} mode={mode} scale={font.scale} match={ctx.match}
          showNoMatch={ctx.isOwnPage && !!page && !ctx.match} jumpSignal={jump} onRetry={ctx.retry}
        />

        <Foot>
          <NavRow>
            <IconBtn onClick={() => page?.prev && ctx.setAt(page.prev)} disabled={!page?.prev} aria-label={HE.TC_PREV}>→ {HE.TC_PREV_SHORT}</IconBtn>
            {page && <SefariaLink href={page.sefariaUrl} target="_blank" rel="noopener noreferrer">{HE.TC_SEFARIA}</SefariaLink>}
            <IconBtn onClick={() => page?.next && ctx.setAt(page.next)} disabled={!page?.next} aria-label={HE.TC_NEXT}>{HE.TC_NEXT_SHORT} ←</IconBtn>
          </NavRow>
          <Attribution>{HE.TC_ATTRIBUTION}</Attribution>
        </Foot>
      </Sheet>
    </div>,
    document.body,
  );
}
