'use client';

import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Dedication } from '@/types';
import { LineIcon } from '@/components/common/LineIcons';

const scrollRight = keyframes`
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
`;

const Strip = styled.div`
  width: 100%;
  overflow: hidden;
  direction: ltr;
  background: ${theme.colors.goldSoft};
  border-bottom: 1px solid color-mix(in srgb, ${theme.colors.gold} 30%, transparent);
  padding: 7px 0;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
`;

const Tape = styled.div.attrs({ className: 'anim-loop' })<{ $secs: number }>`
  display: inline-flex; white-space: nowrap; will-change: transform;
  animation: ${scrollRight} ${p => p.$secs}s linear infinite;
`;

const Item = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 26px;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.sm}; font-weight: 500;
  color: ${theme.colors.text}; white-space: nowrap; direction: rtl;
`;

const TypeLabel = styled.span`
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.secondaryText}; font-weight: 700;
`;

const TypeIcon = styled.span`display: inline-flex; color: ${theme.colors.gold};`;

const TYPES: Record<string, { icon: string; label: string }> = {
  iluy:     { icon: 'candle', label: HE.DEDICATION_TYPE_ILUY },
  refua:    { icon: 'heart', label: HE.DEDICATION_TYPE_REFUA },
  hatzlaha: { icon: 'sparkle', label: HE.DEDICATION_TYPE_HATZLAHA },
  zivug:    { icon: 'users', label: HE.DEDICATION_TYPE_ZIVUG },
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
            <TypeIcon aria-hidden="true"><LineIcon name={TYPES[d.type]?.icon ?? 'candle'} size={14} strokeWidth={1.9} /></TypeIcon>
            <TypeLabel>{TYPES[d.type]?.label ?? d.type}</TypeLabel>
            {d.name}
          </Item>
        ))}
      </Tape>
    </Strip>
  );
}
