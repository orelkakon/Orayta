'use client';

import { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Citation } from '@/types';
import Modal from '@/components/common/Modal';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CitationContent = styled.blockquote`
  font-family: ${theme.fonts.body};
  font-size: 1.15rem;
  line-height: 1.9;
  color: ${theme.colors.text};
  border-right: 4px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  animation: ${fadeIn} 0.25s ease;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const Tag = styled.span`
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: 2px ${theme.spacing.sm};
  font-size: 0.82rem;
  color: ${theme.colors.textMuted};
  font-family: ${theme.fonts.body};
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const NextBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  transition: background 0.15s;
  &:hover { background: ${theme.colors.primaryLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const RandomBtn = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background: ${theme.colors.surfaceAlt};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  transition: all 0.15s;
  &:hover { background: ${theme.colors.borderLight}; border-color: ${theme.colors.primaryLight}; }
`;

interface Props {
  masechet: string;
  seder: string;
  search: string;
}

function formatLocation(loc: Citation['locations'][0]) {
  let s = `${loc.masechet} ${loc.daf}`;
  if (loc.amud) s += ` עמוד ${loc.amud}`;
  return s;
}

export default function RandomCitationModal({ masechet, seder, search }: Props) {
  const [open, setOpen] = useState(false);
  const [citation, setCitation] = useState<Citation | null>(null);
  const [loadingRandom, setLoadingRandom] = useState(false);

  const fetchRandom = useCallback(async () => {
    setLoadingRandom(true);
    const params = new URLSearchParams({ random: 'true' });
    if (masechet) params.set('masechet', masechet);
    else if (seder) params.set('seder', seder);
    if (search) params.set('search', search);
    const res = await fetch(`/api/citations?${params}`);
    const data = await res.json() as Citation | null;
    setCitation(data);
    setLoadingRandom(false);
  }, [masechet, seder, search]);

  const handleOpen = async () => {
    setOpen(true);
    await fetchRandom();
  };

  const handleNext = () => { void fetchRandom(); };

  return (
    <>
      <RandomBtn onClick={handleOpen}>
        🎲 {HE.STUDY_RANDOM_BUTTON}
      </RandomBtn>

      {open && (
        <Modal title={HE.STUDY_RANDOM_TITLE} onClose={() => setOpen(false)}>
          {loadingRandom || !citation ? (
            <CitationContent style={{ color: theme.colors.textMuted }}>{HE.LOADING}</CitationContent>
          ) : (
            <>
              <CitationContent key={citation.id}>{citation.content}</CitationContent>
              <Tags>
                {citation.locations.map((loc) => (
                  <Tag key={loc.id}>{formatLocation(loc)}</Tag>
                ))}
              </Tags>
            </>
          )}
          <ButtonRow>
            <NextBtn onClick={handleNext} disabled={loadingRandom}>
              {loadingRandom ? <Spinner /> : null}
              {HE.STUDY_RANDOM_NEXT} 🎲
            </NextBtn>
          </ButtonRow>
        </Modal>
      )}
    </>
  );
}
