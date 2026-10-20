'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { GhostButton, reduced, rise } from './playStyles';

/** Dark bottom sheet (centered dialog on wide screens) for the game pages. */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.modal};
  background: rgba(4,6,16,0.66);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  @media (min-width: 700px) { align-items: center; }
`;
const Panel = styled.div`
  width: 100%;
  max-width: 520px;
  max-height: 86vh;
  overflow-y: auto;
  background: ${theme.game.stageSolid};
  color: ${theme.game.ink};
  border: 1px solid ${theme.game.glassLine};
  border-radius: ${theme.radii.xl} ${theme.radii.xl} 0 0;
  padding: ${theme.spacing.lg} ${theme.spacing.lg} max(${theme.spacing.lg}, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  animation: ${rise} 0.3s ${theme.motion.out} both;
  font-family: ${theme.fonts.ui};
  direction: rtl;
  @media (min-width: 700px) { border-radius: ${theme.radii.xl}; }
  ${reduced};
`;
const Head = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;
const H = styled.h2`margin: 0; font-size: ${theme.fontSizes.xl}; font-family: ${theme.fonts.body};`;

interface Props { title: string; onClose: () => void; children: React.ReactNode; }

export default function PlaySheet({ title, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <Backdrop onClick={onClose}>
      <Panel ref={panel} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onClick={e => e.stopPropagation()}>
        <Head>
          <H>{title}</H>
          <GhostButton type="button" onClick={onClose} aria-label={HE.PLAY_CANCEL}>✕</GhostButton>
        </Head>
        {children}
      </Panel>
    </Backdrop>,
    document.body,
  );
}
