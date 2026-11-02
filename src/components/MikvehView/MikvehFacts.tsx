'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Mikveh } from '@/types/mikveh';

const Row = styled.ul`display: flex; flex-wrap: wrap; gap: 6px; list-style: none; padding: 0; margin: 0;`;

const Pill = styled.li<{ $tone: 'women' | 'men' | 'plain' | 'muted' }>`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; line-height: 1.5;
  padding: 3px 10px; border-radius: ${theme.radii.xl};
  border: 1.5px solid ${p => (p.$tone === 'women' ? theme.colors.accent : p.$tone === 'men' ? theme.colors.primary : theme.colors.border)};
  color: ${p => (p.$tone === 'women' ? theme.colors.accent : p.$tone === 'men' ? theme.colors.primary : p.$tone === 'muted' ? theme.colors.textMuted : theme.colors.text)};
  background: ${theme.colors.surface};
`;

/** Who it serves + facilities, only what a source says (unknown = not shown). */
export default function MikvehFacts({ m }: { m: Mikveh }) {
  const typeKnown = m.women !== null || m.men !== null || m.vessels !== null;
  const fee = m.fee
    ? (m.fee.text ? HE.MK_FEE(m.fee.text) : m.fee.paid ? HE.MK_FEE_PAID : m.fee.paid === false ? HE.MK_FEE_FREE : null)
    : null;

  return (
    <Row>
      {m.women && <Pill $tone="women">{HE.MK_TYPE_WOMEN}</Pill>}
      {m.men && <Pill $tone="men">{HE.MK_TYPE_MEN}</Pill>}
      {m.vessels && <Pill $tone="plain">{HE.MK_TYPE_VESSELS}</Pill>}
      {!typeKnown && <Pill $tone="muted">{HE.MK_TYPE_UNKNOWN}</Pill>}
      {m.accessibility && <Pill $tone={m.accessibility === 'none' ? 'muted' : 'plain'}>♿ {HE.MK_ACCESS[m.accessibility]}</Pill>}
      {m.brideRoom && <Pill $tone="plain">{HE.MK_BRIDE_ROOM}</Pill>}
      {m.shelter && <Pill $tone="plain">{HE.MK_SHELTER}</Pill>}
      {m.onDuty && <Pill $tone="plain">{HE.MK_ON_DUTY}</Pill>}
      {fee && <Pill $tone="plain">{fee}</Pill>}
    </Row>
  );
}
