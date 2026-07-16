'use client';

import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Dedication } from '@/types';

const scrollRight = keyframes`
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
`;

const Strip = styled.div`
  position: sticky;
  top: 60px;
  z-index: 95;
  width: 100%;
  overflow: hidden;
  direction: ltr;
  background: linear-gradient(90deg, ${theme.colors.primary} 0%, #7a4e28 50%, ${theme.colors.primary} 100%);
  border-bottom: 1px solid ${theme.colors.secondary}66;
  box-shadow: ${theme.shadows.sm};
  padding: 5px 0;
  @media (max-width: 480px) { top: 52px; }
`;

const Tape = styled.div<{ $secs: number }>`
  display: inline-flex; white-space: nowrap; will-change: transform;
  animation: ${scrollRight} ${p => p.$secs}s linear infinite;
`;

const Item = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 26px;
  font-family: ${theme.fonts.body}; font-size: 0.82rem; font-weight: 500;
  color: rgba(255, 255, 255, 0.92); white-space: nowrap; direction: rtl;
`;

const TypeLabel = styled.span`
  font-size: 0.72rem; color: ${theme.colors.secondary}; font-weight: 700;
`;

const TYPES: Record<string, { icon: string; label: string }> = {
  iluy:     { icon: '🕯️', label: HE.DEDICATION_TYPE_ILUY },
  refua:    { icon: '❤️‍🩹', label: HE.DEDICATION_TYPE_REFUA },
  hatzlaha: { icon: '🌟', label: HE.DEDICATION_TYPE_HATZLAHA },
  zivug:    { icon: '💍', label: HE.DEDICATION_TYPE_ZIVUG },
};

export default function DedicationsTicker() {
  const [dedications, setDedications] = useState<Dedication[]>([]);

  useEffect(() => {
    void fetch('/api/dedications')
      .then(r => r.json())
      .then((d: unknown) => setDedications(d as Dedication[]))
      .catch(() => {});
  }, []);

  // Doubled tape so the loop is seamless
  const items = useMemo(() => [...dedications, ...dedications], [dedications]);

  if (dedications.length === 0) return null;

  const secs = Math.max(dedications.length * 3.2, 18);

  return (
    <Strip aria-label={HE.DEDICATIONS_TITLE}>
      <Tape $secs={secs}>
        {items.map((d, i) => (
          <Item key={`${d.id}-${i}`}>
            <span>{TYPES[d.type]?.icon ?? '🕯️'}</span>
            <TypeLabel>{TYPES[d.type]?.label ?? d.type}</TypeLabel>
            {d.name}
          </Item>
        ))}
      </Tape>
    </Strip>
  );
}
