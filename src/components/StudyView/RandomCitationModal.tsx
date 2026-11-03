'use client';

import { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Citation } from '@/types';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';

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


const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  /* Inherit the button's text colour so the spinner stays visible in both
     themes; the transparent segment is what reads as rotation. */
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
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
      <Button $variant="secondary" $size="sm" onClick={handleOpen}>
        <LineIcon name="shuffle" size={16} strokeWidth={2} />{HE.STUDY_RANDOM_BUTTON}
      </Button>

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
            <Button onClick={handleNext} disabled={loadingRandom}>
              {loadingRandom ? <Spinner /> : <LineIcon name="shuffle" size={16} strokeWidth={2} />}
              {HE.STUDY_RANDOM_NEXT}
            </Button>
          </ButtonRow>
        </Modal>
      )}
    </>
  );
}
