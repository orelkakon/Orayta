'use client';

import { useEffect, useId, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  z-index: ${theme.z.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md};
  animation: ${fadeIn} 0.2s ease;
`;

const Content = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  animation: ${slideIn} 0.3s ${theme.motion.out};
  box-shadow: ${theme.shadows.lg};
  /* 32px of padding either side of a 296px form is most of the screen. */
  @media (max-width: 600px) { padding: ${theme.spacing.md}; }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.primary};
`;

const CloseButton = styled.button`
  font-size: 1.4rem;
  color: ${theme.colors.textMuted};
  line-height: 1;
  min-width: 44px;
  min-height: 44px;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.radii.sm};
  transition: color ${theme.motion.fast} ease, background ${theme.motion.fast} ease,
    transform ${theme.motion.fast} ease;

  &:hover {
    color: ${theme.colors.text};
    background: ${theme.colors.surfaceAlt};
  }
  &:active { transform: scale(0.92); }
`;

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    contentRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      // Keep Tab inside the dialog — otherwise focus walks the page behind it.
      const focusables = contentRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    window.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Content
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <Header>
          <Title id={titleId}>{title}</Title>
          <CloseButton onClick={onClose} aria-label={HE.CLOSE}>×</CloseButton>
        </Header>
        {children}
      </Content>
    </Overlay>
  );
}
