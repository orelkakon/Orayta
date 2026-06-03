'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import CitationForm from '@/components/CitationForm/CitationForm';
import { Amud } from '@/types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${theme.colors.primary};
`;

const Toast = styled.div<{ $type: 'success' | 'error' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${({ $type }) => ($type === 'success' ? '#E8F5E9' : '#FDECEA')};
  color: ${({ $type }) => ($type === 'success' ? theme.colors.success : theme.colors.error)};
  font-weight: 500;
  animation: ${fadeIn} 0.3s ease;
`;

interface SaveData {
  content: string;
  locations: Array<{ masechet: string; daf: string; amud: Amud | null }>;
}

export default function AddCitation() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [key, setKey] = useState(0);
  const router = useRouter();

  const handleSave = async (data: SaveData) => {
    const res = await fetch('/api/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setToast({ msg: HE.ADD_SUCCESS, type: 'success' });
      setKey((k) => k + 1);
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ msg: HE.ADD_ERROR, type: 'error' });
    }
  };

  return (
    <Container>
      <Title>{HE.ADD_TITLE}</Title>
      {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}
      <CitationForm key={key} onSave={handleSave} submitLabel={HE.ADD_SUBMIT} />
    </Container>
  );
}
