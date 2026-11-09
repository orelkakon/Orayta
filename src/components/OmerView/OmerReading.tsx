'use client';

import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { omerCount } from '@/lib/omer';

const fade = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;

const Body = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  animation: ${fade} 0.35s ${theme.motion.outStrong} both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Instruction = styled.p`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.6;
  padding-inline-start: 10px; border-inline-start: 2px solid ${theme.colors.borderLight};
`;
const Text = styled.p`font-family: ${theme.fonts.body}; font-size: calc(1.3rem * var(--siddur-scale, 1)); line-height: 2.1; color: ${theme.colors.text};`;
const Count = styled.p`
  font-family: ${theme.fonts.body}; font-size: calc(1.55rem * var(--siddur-scale, 1)); line-height: 2; font-weight: 700; color: ${theme.colors.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: color-mix(in srgb, ${theme.colors.secondary} 10%, transparent);
  border-inline-start: 4px solid ${theme.colors.secondary};
  ${theme.media.sm} { font-size: calc(1.35rem * var(--siddur-scale, 1)); }
`;
const Sefira = styled.p`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};
  strong { font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${theme.colors.secondary}; }
`;
const More = styled(Link)`
  align-self: flex-start; font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondary};
  min-height: 36px; display: inline-flex; align-items: center;
  &:hover { text-decoration: underline; }
`;

interface Props {
  day: number;
  /** A daytime count after forgetting at night: no bracha. */
  noBracha?: boolean;
  /** Show the day's sefira under the count. */
  sefira?: boolean;
}

/** What one says for a day: bracha, the count (large), its sefira and הרחמן. */
export default function OmerReading({ day, noBracha = false, sefira = false }: Props) {
  const c = omerCount(day);
  if (!c) return null;
  return (
    <Body key={day}>
      <Instruction>{noBracha ? HE.OMER_FORGOT_BODY(day) : HE.OMER_STAND_NOTE}</Instruction>
      {!noBracha && <Text>{HE.OMER_BRACHA}</Text>}
      <Count>{HE.OMER_HAYOM} {c.text}</Count>
      {sefira && <Sefira>{HE.OMER_SEFIRA_LABEL}<strong>{c.sefira}</strong></Sefira>}
      <Text>{HE.OMER_HARACHAMAN}</Text>
      <More href="/siddur/arvit#omer">{HE.OMER_FULL_ORDER} ←</More>
    </Body>
  );
}
