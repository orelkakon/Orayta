'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import { joinUrl } from './playClient';
import { GhostButton, press } from './playStyles';

/**
 * Invite people: a ready WhatsApp message (code + one-tap link), the native
 * share sheet where there is one, and plain copy of the invite / link / code.
 */
const Row = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm}; justify-content: center;`;
const WhatsApp = styled.button`
  ${press};
  min-height: 44px;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: 999px;
  background: ${theme.brand.whatsapp};
  color: ${theme.brand.whatsappText};
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.sm};
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

/** Plain lines — each starts with Hebrew, so WhatsApp renders them RTL by itself
    (invisible RLM marks made some WhatsApp builds drop the prefilled text). */
export function inviteText(code: string, total: number, seconds: number): string {
  const spaced = `${code.slice(0, 3)} ${code.slice(3)}`;
  return HE.PLAY_INVITE_LINES(spaced, joinUrl(code), total, seconds).join('\n');
}

/** Phones: the app's own scheme opens the contact picker with the text ready.
    Desktop: WhatsApp Web / the desktop app via api.whatsapp.com. */
function openWhatsApp(text: string): void {
  const t = encodeURIComponent(text);
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) window.location.href = `whatsapp://send?text=${t}`;
  else window.open(`https://api.whatsapp.com/send?text=${t}`, '_blank', 'noopener');
}

function Copy({ label, text }: { label: string; text: string }) {
  const [done, setDone] = useState(false);
  return (
    <GhostButton type="button" onClick={() => {
      void navigator.clipboard?.writeText(text).then(() => {
        haptics.success();
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      });
    }}>{done ? HE.PLAY_COPIED : label}</GhostButton>
  );
}

interface Props { code: string; total: number; seconds: number; }

export default function InviteActions({ code, total, seconds }: Props) {
  const text = inviteText(code, total, seconds);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  return (
    <Row>
      <WhatsApp type="button" onClick={() => openWhatsApp(text)}>
        💬 {HE.PLAY_SHARE_WA}
      </WhatsApp>
      {canShare && (
        <GhostButton type="button" onClick={() => { void navigator.share({ text }).catch(() => undefined); }}>
          📤 {HE.PLAY_SHARE_NATIVE}
        </GhostButton>
      )}
      <Copy label={HE.PLAY_COPY_INVITE} text={text} />
      <Copy label={HE.PLAY_COPY_LINK} text={joinUrl(code)} />
      <Copy label={HE.PLAY_COPY_CODE} text={code} />
    </Row>
  );
}
