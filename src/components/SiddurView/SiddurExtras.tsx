'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { SIDDUR_EXTRAS } from '@/lib/siddurContent';
import SiddurSectionBody from '@/components/ContentsView/SiddurSectionBody';

const Block = styled.section`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;

const Heading = styled.h2`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.primary};
  padding-bottom: 6px; border-bottom: 2px solid ${theme.colors.borderLight};
`;

const Row = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;

const Pill = styled.button<{ $on: boolean }>`
  display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px;
  border-radius: 999px; font-size: ${theme.fontSizes.sm}; font-weight: 600;
  color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.primary};
  background: ${p => p.$on ? theme.colors.primary : theme.colors.surface};
  border: 1px solid ${p => p.$on ? theme.colors.primary : theme.colors.borderLight};
  &:hover { border-color: ${theme.colors.secondary}; }
  svg { color: ${p => p.$on ? 'inherit' : theme.colors.secondary}; }
`;

const Viewer = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md}; padding-top: ${theme.spacing.sm};`;

/** Standalone siddur pieces (bedtime Shema, Kaddish…), opened inline. */
export default function SiddurExtras() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = SIDDUR_EXTRAS.find(x => x.id === openId);

  return (
    <Block>
      <Heading>{HE.SIDDUR_EXTRAS_TITLE}</Heading>
      <Row>
        {SIDDUR_EXTRAS.map(x => (
          <Pill key={x.id} $on={x.id === openId} aria-expanded={x.id === openId} onClick={() => setOpenId(id => id === x.id ? null : x.id)}>
            <LineIcon name={x.icon} size={16} strokeWidth={1.8} />{x.name}
          </Pill>
        ))}
      </Row>
      {open && <Viewer><SiddurSectionBody section={open} /></Viewer>}
    </Block>
  );
}
