'use client';

import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
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
  animation: ${slideIn} 0.25s ease;
  box-shadow: ${theme.shadows.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: 1.3rem;
  color: ${theme.colors.primary};
`;

const CloseButton = styled.button`
  font-size: 1.4rem;
  color: ${theme.colors.textLight};
  line-height: 1;
  padding: ${theme.spacing.xs};
  transition: color 0.15s;

  &:hover {
    color: ${theme.colors.text};
  }
`;

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Content>
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onClose} aria-label={HE.CLOSE}>×</CloseButton>
        </Header>
        {children}
      </Content>
    </Overlay>
  );
}
