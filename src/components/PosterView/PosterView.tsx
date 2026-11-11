'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';
import PosterSheet from './PosterSheet';

/**
 * דף לבית הכנסת — a designed A4 page for the notice board, with QR codes to
 * מניין קרוב, the siddur and חלוקת תהילים. The preview sits in the page; the
 * copy that gets printed is portaled straight under <body>, and in print
 * everything else is removed — one clean page whatever the app shell holds.
 * The synagogue's name lives in this component only (never stored or sent).
 */
const PRINT_ID = 'poster-print';

/* No viewport units in print: Safari resolves vh against the window, not the
   sheet, which printed the page small with empty sides. The sheet takes the
   paper's full width and its height follows — shorter than A4's ratio, so the
   margins a browser adds (Safari's headers and footers) still leave it on one
   page. */
const PrintRules = createGlobalStyle`
  #${PRINT_ID} { display: none; }
  @media print {
    @page { size: A4 portrait; margin: 0; }
    html, body {
      background: ${theme.game.qrLight} !important;
      width: auto !important; height: auto !important; min-height: 0 !important;
      margin: 0 !important; padding: 0 !important; overflow: visible !important;
    }
    body > *:not(#${PRINT_ID}) { display: none !important; }
    #${PRINT_ID} { display: block; width: 100%; }
    #${PRINT_ID} [data-poster] { width: 100%; aspect-ratio: 210 / 280; break-inside: avoid; }
  }
`;

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const Controls = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.ms};
  ${theme.up.md} { flex-direction: row; align-items: flex-end; }
`;

const Field = styled.label`
  flex: 1; display: flex; flex-direction: column; gap: 6px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.textMuted};
`;

const Input = styled.input`
  min-height: 48px; padding: 0 ${theme.spacing.md};
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  font-size: ${theme.fontSizes.md};
  &:focus { outline: 2px solid color-mix(in srgb, ${theme.colors.primary} 25%, transparent); border-color: ${theme.colors.primary}; }
`;

const Tip = styled.p`font-size: ${theme.fontSizes.xs}; line-height: 1.6; color: ${theme.colors.textMuted};`;

const Preview = styled.div`
  width: 100%; max-width: 560px; margin: 0 auto;
  border-radius: ${theme.radii.sm}; overflow: hidden;
  box-shadow: ${theme.shadows.md}, 0 0 0 1px ${theme.colors.borderLight};
`;

export default function PosterView() {
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shown = name.trim().replace(/\s+/g, ' ');

  return (
    <Wrap>
      <PrintRules />
      <PageHeader icon="synagogue" title={HE.POSTER_TITLE} subtitle={HE.POSTER_SUBTITLE} />

      <Controls>
        <Field>
          {HE.POSTER_NAME_LABEL}
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={HE.POSTER_NAME_PLACEHOLDER}
            maxLength={40}
            autoComplete="off"
            enterKeyHint="done"
          />
        </Field>
        <Button $variant="gold" $size="lg" onClick={() => window.print()}>
          <LineIcon name="download" size={18} strokeWidth={2} />{HE.POSTER_PRINT}
        </Button>
      </Controls>

      <Preview role="img" aria-label={HE.POSTER_PREVIEW_ARIA}><PosterSheet name={shown} /></Preview>

      <Tip>{HE.POSTER_TIP}<br />{HE.POSTER_NOTE}</Tip>

      {mounted && createPortal(<div id={PRINT_ID} aria-hidden="true"><PosterSheet name={shown} /></div>, document.body)}
    </Wrap>
  );
}
