'use client';

import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useBodyScrollLock } from '@/components/common/useBodyScrollLock';
import { usePresence } from './usePresence';
import { useDialogFocus } from './useDialogFocus';
import { useSheetDrag } from './useSheetDrag';
import { useViewportBox } from './useViewportBox';
import IconButton from './IconButton';
import { LineIcon } from '@/components/common/LineIcons';

/**
 * The one overlay primitive. Phones/tablets: a bottom sheet that follows the
 * finger and dismisses on a pull or a flick. Desktop (≥769px): a centred
 * dialog. Portalled, iOS-safe scroll lock, focus trap, Escape, safe areas.
 * `full` (editors): the whole screen above the keyboard on phones, a tall
 * dialog on desktop. `guarded` (forms with typed text): only the handle,
 * the title, the close button and Escape dismiss it.
 */

const EXIT_MS = 260;
const SHEET_MQ = '(max-width: 768px)';

const Backdrop = styled.div<{ $shown: boolean }>`
  position: fixed; inset: 0; z-index: ${theme.z.sheet};
  background: ${theme.colors.scrim};
  -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
  opacity: ${p => (p.$shown ? 1 : 0)};
  transition: opacity ${p => (p.$shown ? '0.32s' : '0.22s')} ease;
`;

const SAFE_B = `var(--sheet-safe-b, ${theme.safe.bottom})`;

// Phones: from under the status bar to the top of the keyboard (useViewportBox).
const fullPhone = css`
  top: calc(var(--vv-top, 0px) + ${theme.safe.top} + 8px); bottom: auto;
  height: calc(var(--vv-h, 100dvh) - ${theme.safe.top} - 8px);
  max-height: none;
`;

const Panel = styled.div<{ $shown: boolean; $maxWidth: number; $tall: boolean; $full: boolean }>`
  position: fixed; z-index: ${theme.z.sheet + 1};
  display: flex; flex-direction: column;
  background: ${theme.colors.elevated}; color: ${theme.colors.text};
  box-shadow: ${theme.shadows.lg};
  outline: none; direction: rtl;

  left: 0; right: 0; bottom: 0; margin-inline: auto;
  width: 100%; max-width: 640px;
  max-height: calc(100dvh - ${theme.safe.top} - 12px);
  min-height: ${p => (p.$tall ? 'min(70dvh, 560px)' : '0')};
  border-radius: 24px 24px 0 0;
  transform: translate3d(0, ${p => (p.$shown ? '0' : '100%')}, 0);
  transition: transform ${p => (p.$shown ? `0.36s ${theme.motion.drawer}` : `0.24s ${theme.motion.drawer}`)};
  ${p => p.$full && fullPhone}

  ${theme.up.md} {
    left: 50%; right: auto; bottom: auto; top: 50%;
    width: calc(100% - 48px); max-width: ${p => p.$maxWidth}px;
    height: ${p => (p.$full ? 'min(90dvh, 960px)' : 'auto')};
    max-height: ${p => (p.$full ? 'none' : 'min(86dvh, 820px)')}; min-height: 0;
    border-radius: 20px;
    opacity: ${p => (p.$shown ? 1 : 0)};
    transform: translate(-50%, -50%) scale(${p => (p.$shown ? 1 : 0.96)});
    transition: opacity 0.2s ease, transform 0.24s ${theme.motion.outStrong};
  }
`;

const Handle = styled.div`
  flex-shrink: 0; display: flex; justify-content: center; padding: 10px 0 2px;
  touch-action: none;
  &::before {
    content: ''; width: 38px; height: 5px; border-radius: 3px;
    background: color-mix(in srgb, ${theme.colors.text} 18%, transparent);
  }
  ${theme.up.md} { display: none; }
`;

const Head = styled.div`
  flex-shrink: 0; display: flex; align-items: center; gap: ${theme.spacing.sm};
  padding: 6px ${theme.spacing.md} ${theme.spacing.sm} 8px;
  touch-action: none;
  ${theme.up.md} { padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.sm} ${theme.spacing.sm}; }
`;

const Title = styled.h2`
  flex: 1; min-width: 0;
  font-size: ${theme.fontSizes.xl}; line-height: 1.25; color: ${theme.colors.text};
`;

const Body = styled.div<{ $pad: boolean; $full: boolean }>`
  flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
  ${p => p.$full && 'display: flex; flex-direction: column;'}
  -webkit-overflow-scrolling: touch;
  padding: ${p => (p.$pad ? `4px ${theme.spacing.md} ${theme.spacing.md}` : '0')};
  padding-bottom: calc(${p => (p.$pad ? theme.spacing.md : '0px')} + ${SAFE_B});
  ${theme.up.md} {
    padding: ${p => (p.$pad ? `4px ${theme.spacing.lg} ${theme.spacing.lg}` : '0')};
  }
`;

const Foot = styled.div`
  flex-shrink: 0; padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-bottom: calc(${theme.spacing.sm} + ${SAFE_B});
  border-top: 1px solid ${theme.colors.borderLight};
  ${theme.up.md} { padding: ${theme.spacing.md} ${theme.spacing.lg}; }
`;

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Visible heading; when absent, pass `ariaLabel`. */
  title?: ReactNode;
  ariaLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Desktop dialog width (px). */
  maxWidth?: number;
  /** Give the mobile sheet a generous minimum height (lists, search). */
  tall?: boolean;
  /** Default true — body gets standard padding. */
  padded?: boolean;
  /** Full-screen editor surface; the body becomes a flex column. */
  full?: boolean;
  /** No dismiss from a backdrop tap or a pull on the body. */
  guarded?: boolean;
}

export default function Sheet({
  open, onClose, title, ariaLabel, children, footer, maxWidth = 560, tall = false, padded = true,
  full = false, guarded = false,
}: SheetProps) {
  const { mounted, shown } = usePresence(open, EXIT_MS);
  const [isSheet, setIsSheet] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const mq = window.matchMedia(SHEET_MQ);
    const sync = () => setIsSheet(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useBodyScrollLock(mounted);
  useDialogFocus(open && mounted, panel, onClose);
  useSheetDrag(mounted && isSheet, panel, body, backdrop, onClose, !guarded);
  useViewportBox(mounted && isSheet && full, panel);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <Backdrop ref={backdrop} $shown={shown} onClick={guarded ? undefined : onClose} aria-hidden="true" />
      <Panel
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        $shown={shown}
        $maxWidth={maxWidth}
        $tall={tall}
        $full={full}
      >
        <Handle aria-hidden="true" />
        {title && (
          <Head>
            <Title id={titleId}>{title}</Title>
            <IconButton $variant="tonal" $size="sm" onClick={onClose} aria-label={HE.CLOSE}>
              <LineIcon name="close" size={18} strokeWidth={2} />
            </IconButton>
          </Head>
        )}
        <Body ref={body} $pad={padded} $full={full}>{children}</Body>
        {footer && <Foot>{footer}</Foot>}
      </Panel>
    </>,
    document.body,
  );
}
