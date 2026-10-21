'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';

/** A phone-notification look-alike so the admin sees what people will get. */
const Wrap = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const Cap = styled.div`font-size: 0.75rem; font-weight: 600; color: ${theme.colors.textMuted};`;
const Card = styled.div`
  display: flex; gap: 10px; align-items: flex-start;
  padding: 10px 12px; border-radius: 18px; max-width: 380px;
  background: ${theme.colors.surfaceAlt}; border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.md};
`;
const Icon = styled.div`
  flex: none; width: 36px; height: 36px; border-radius: 9px; overflow: hidden;
  background: ${theme.colors.primary}; display: flex; align-items: center; justify-content: center;
  svg { width: 26px; height: 26px; }
`;
const T = styled.div`font-weight: 700; font-size: 0.9rem; color: ${theme.colors.text};`;
const B = styled.div`font-size: 0.85rem; color: ${theme.colors.textMuted}; line-height: 1.4; white-space: pre-wrap; word-break: break-word;`;

export default function BroadcastPreview({ title, body }: { title: string; body: string }) {
  return (
    <Wrap>
      <Cap>{HE.ADMIN_BC_PREVIEW}</Cap>
      <Card aria-hidden>
        <Icon><OraytaLogo size={26} /></Icon>
        <div><T>{title}</T><B>{body}</B></div>
      </Card>
    </Wrap>
  );
}
