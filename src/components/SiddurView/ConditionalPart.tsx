'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const Box = styled.div<{ $open: boolean; $today: boolean }>`
  scroll-margin-top: var(--siddur-offset, 180px);
  margin: ${theme.spacing.md} 0;
  border-radius: ${theme.radii.md};
  border: 1px ${p => p.$today ? 'solid' : 'dashed'} ${p => p.$today ? theme.colors.secondary : theme.colors.border};
  background: ${p => p.$today ? theme.colors.surface : theme.colors.surfaceAlt};
  padding: ${p => p.$open ? `${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.xs}` : `${theme.spacing.xs} ${theme.spacing.md}`};
  transition: background ${theme.motion.fast} ease;
`;

const Head = styled.button`
  width: 100%; min-height: 44px; display: flex; align-items: center; gap: ${theme.spacing.sm};
  text-align: start; color: ${theme.colors.text};
`;

const Name = styled.span`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.primary};`;
const When = styled.span`flex: 1; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;

const Today = styled.span`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.onPrimary};
  background: ${theme.colors.secondary}; border-radius: 999px; padding: 2px 9px;
`;

const Action = styled.span`
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.secondary}; white-space: nowrap;
`;

interface Props {
  id?: string;
  title: string;
  note?: string;
  applies: boolean;
  children: React.ReactNode;
}

/** A seasonal block: open with a "said today" badge when it applies, folded otherwise. */
export default function ConditionalPart({ id, title, note, applies, children }: Props) {
  const [open, setOpen] = useState(applies);
  return (
    <Box id={id} $open={open} $today={applies}>
      <Head onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <Name>{title}</Name>
        <When>{note}</When>
        {applies && <Today>{HE.SIDDUR_SAID_TODAY}</Today>}
        <Action>{open ? HE.SIDDUR_HIDE : HE.SIDDUR_SHOW}</Action>
      </Head>
      {open && children}
    </Box>
  );
}
