'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import CitationForm from '@/components/CitationForm/CitationForm';
import { useRole } from '@/components/common/RoleContext';
import { Amud, Citation } from '@/types';

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
  background: ${({ $type }) => ($type === 'success' ? theme.colors.bgSuccess : theme.colors.bgError)};
  color: ${({ $type }) => ($type === 'success' ? theme.colors.success : theme.colors.error)};
  font-weight: 500;
  animation: ${fadeIn} 0.3s ease;
`;

const DuplicateBox = styled.div`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.bgWarning};
  border: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  animation: ${fadeIn} 0.3s ease;
`;

const DupTitle = styled.p`font-weight: 700; color: ${theme.colors.text};`;
const DupLocation = styled.p`font-size: 0.9rem; color: ${theme.colors.textMuted};`;
const DupDismiss = styled.button`
  align-self: flex-start;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  font-size: 0.85rem;
  color: ${theme.colors.textMuted};
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;

const DeniedCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xxl};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`;

const LockIcon = styled.div`
  font-size: 3rem;
  line-height: 1;
`;

const DeniedTitle = styled.h2`
  font-size: 1.4rem;
  color: ${theme.colors.primary};
`;

const DeniedText = styled.p`
  font-size: 0.95rem;
  color: ${theme.colors.textMuted};
`;

const BackLink = styled(Link)`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  font-weight: 600;
  transition: background 0.15s;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

interface SaveData {
  content: string;
  locations: Array<{ masechet: string; daf: string; amud: Amud | null }>;
}

export default function AddCitation() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [duplicate, setDuplicate] = useState<Citation | null>(null);
  const [key, setKey] = useState(0);
  const role = useRole();

  if (role === 'reader') {
    return (
      <Container>
        <Title>{HE.ADD_TITLE}</Title>
        <DeniedCard>
          <LockIcon>🔒</LockIcon>
          <DeniedTitle>אין לך הרשאות</DeniedTitle>
          <DeniedText>רק מנהלי המערכת יכולים להוסיף ציטוטים חדשים</DeniedText>
          <BackLink href="/study">חזרה ללימוד</BackLink>
        </DeniedCard>
      </Container>
    );
  }

  const handleSave = async (data: SaveData) => {
    setDuplicate(null);
    const res = await fetch('/api/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.status === 409) {
      const body = await res.json() as { existing: Citation };
      setDuplicate(body.existing);
      return;
    }
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
      {duplicate && (
        <DuplicateBox>
          <DupTitle>{HE.DUPLICATE_CITATION_TITLE}</DupTitle>
          <DupLocation>
            {HE.DUPLICATE_CITATION_FOUND_AT}{' '}
            {duplicate.locations.map(l => `${l.masechet} ${l.daf}${l.amud ? ` ${l.amud}` : ''}`).join(' / ')}
          </DupLocation>
          <DupDismiss onClick={() => setDuplicate(null)}>{HE.DUPLICATE_CITATION_DISMISS}</DupDismiss>
        </DuplicateBox>
      )}
      <CitationForm key={key} onSave={handleSave} submitLabel={HE.ADD_SUBMIT} />
    </Container>
  );
}
