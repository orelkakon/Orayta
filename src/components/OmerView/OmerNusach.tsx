'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OmerReading from './OmerReading';

const Card = styled.section`
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg}; border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
  ${theme.media.sm} { padding: ${theme.spacing.md}; }
`;
const Head = styled.h2`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 800; color: ${theme.colors.primary};
  &::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to left, color-mix(in srgb, ${theme.colors.secondary} 40%, transparent), transparent); }
`;

/** Tonight's bracha + count + הרחמן, large; `noBracha` for a daytime count after forgetting. */
export default function OmerNusach({ day, noBracha = false }: { day: number; noBracha?: boolean }) {
  return (
    <Card aria-labelledby="omer-nusach">
      <Head id="omer-nusach">{HE.OMER_NUSACH_TITLE}</Head>
      <OmerReading day={day} noBracha={noBracha} />
    </Card>
  );
}
