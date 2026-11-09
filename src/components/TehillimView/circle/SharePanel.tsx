'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import type { TehillimState } from '@/types/tehillim';
import { circleUrl, shareText } from '@/lib/tehillim/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';
import QrCode from '@/components/PlayView/QrCode';
import { Section, SectionTitle } from '../styles';

/**
 * Inviting more readers: a ready WhatsApp message (heading, how much was
 * read, the link — whose preview shows this reading), the native share sheet,
 * copy, and a QR for a screen at the shul. `fresh` = just opened: the panel
 * leads with a highlight so the organizer sends it right away.
 */
const Highlight = styled(Card)<{ $fresh: boolean }>`
  display: flex; flex-direction: column; gap: ${theme.spacing.ms};
  ${p => p.$fresh && `border-color: ${theme.colors.gold}; box-shadow: 0 0 0 3px ${theme.colors.goldSoft};`}
`;
const Lead = styled.p`margin: 0; font-weight: 700; color: ${theme.colors.text};`;
const Row = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;
const WhatsApp = styled(Button)`
  background: ${theme.brand.whatsapp}; color: ${theme.brand.whatsappText}; border-color: transparent;
  flex: 1 1 200px;
`;
const QrWrap = styled.div`display: flex; justify-content: center; padding: ${theme.spacing.sm} 0;`;

/** Phones open WhatsApp's chat picker with the text; desktops WhatsApp Web. */
function openWhatsApp(text: string): void {
  const t = encodeURIComponent(text);
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) window.location.href = `whatsapp://send?text=${t}`;
  else window.open(`https://api.whatsapp.com/send?text=${t}`, '_blank', 'noopener');
}

export default function SharePanel({ state, fresh }: { state: TehillimState; fresh: boolean }) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState(false);
  const text = shareText(state);
  const url = circleUrl(state.slug);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const copy = () => {
    void navigator.clipboard?.writeText(url).then(() => {
      haptics.success();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <Section aria-labelledby="th-share">
      <SectionTitle id="th-share">{HE.TH_SHARE_TITLE}</SectionTitle>
      <Highlight $pad="md" $fresh={fresh}>
        {fresh && <Lead>✨ {HE.TH_JUST_CREATED}</Lead>}
        <Row>
          <WhatsApp $size="md" onClick={() => openWhatsApp(text)}><LineIcon name="send" size={18} /> {HE.TH_SHARE_WA}</WhatsApp>
          {canShare && (
            <Button $variant="secondary" $size="md" onClick={() => { void navigator.share({ text }).catch(() => undefined); }}>
              <LineIcon name="share" size={18} /> {HE.TH_SHARE_MORE}
            </Button>
          )}
          <Button $variant="tonal" $size="md" onClick={copy}><LineIcon name={copied ? 'check' : 'copy'} size={18} /> {copied ? HE.TH_SHARE_COPIED : HE.TH_SHARE_COPY}</Button>
          <Button $variant="ghost" $size="md" onClick={() => setQr(q => !q)} aria-expanded={qr}><LineIcon name="grid" size={18} /> {HE.TH_SHARE_QR}</Button>
        </Row>
        {qr && <QrWrap><QrCode value={url} size={200} label={HE.TH_SHARE_QR} /></QrWrap>}
      </Highlight>
    </Section>
  );
}
