'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { omerCount } from '@/lib/omer';

const Card = styled.section`
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg}; border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
  ${theme.media.sm} { padding: ${theme.spacing.md}; }
`;
const Head = styled.h2`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 800; color: ${theme.colors.primary};
  &::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to left, ${theme.colors.secondary}66, transparent); }
`;
const Instruction = styled.p`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.6;
  padding-inline-start: 10px; border-inline-start: 2px solid ${theme.colors.borderLight};
`;
const Text = styled.p`font-family: ${theme.fonts.body}; font-size: 1.3rem; line-height: 2.1; color: ${theme.colors.text};`;
const Count = styled.p`
  font-family: ${theme.fonts.body}; font-size: 1.55rem; line-height: 2; font-weight: 700; color: ${theme.colors.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: color-mix(in srgb, ${theme.colors.secondary} 10%, transparent);
  border-inline-start: 4px solid ${theme.colors.secondary};
  ${theme.media.sm} { font-size: 1.35rem; }
`;
const More = styled(Link)`
  align-self: flex-start; font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondary};
  min-height: 36px; display: inline-flex; align-items: center;
  &:hover { text-decoration: underline; }
`;

/** Bracha + the count + הרחמן, large; `noBracha` for a daytime count after forgetting. */
export default function OmerNusach({ day, noBracha = false }: { day: number; noBracha?: boolean }) {
  const c = omerCount(day);
  if (!c) return null;
  return (
    <Card aria-labelledby="omer-nusach">
      <Head id="omer-nusach">{HE.OMER_NUSACH_TITLE}</Head>
      <Instruction>{noBracha ? HE.OMER_FORGOT_BODY(day) : HE.OMER_STAND_NOTE}</Instruction>
      {!noBracha && <Text>{HE.OMER_BRACHA}</Text>}
      <Count>{HE.OMER_HAYOM} {c.text}</Count>
      <Text>{HE.OMER_HARACHAMAN}</Text>
      <More href="/siddur/arvit#omer">{HE.OMER_FULL_ORDER} ←</More>
    </Card>
  );
}
