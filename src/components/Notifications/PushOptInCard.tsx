'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { openNotifications, pushSupport, readLocal } from '@/lib/push/client';
import { Button } from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';

const KEY = 'orayta_push_card';
const DAY_MS = 86400000;

/** Snooze 21 days after the first "not now", for good after the second — never nags. */
function isDismissed(): boolean {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { t: number; n: number } | null;
    return !!v && (v.n >= 2 || Date.now() - v.t < 21 * DAY_MS);
  } catch { return false; }
}
function dismiss() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { n: number } | null;
    localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), n: (v?.n ?? 0) + 1 }));
  } catch { /* private mode */ }
}

const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;

const Card = styled.div`
  position: relative; width: 100%;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.md}; padding-inline-end: 44px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight}; border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.sm};
  animation: ${rise} 0.4s ${theme.motion.outStrong} both;
  flex-wrap: wrap;
`;
const Bell = styled.span`
  width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: ${theme.colors.primary};
  background: ${theme.colors.goldSoft};
  border: 1px solid color-mix(in srgb, ${theme.colors.gold} 40%, transparent);
`;
const Text = styled.div`flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 2px;`;
const Title = styled.div`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text};`;
const Body = styled.div`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.45;`;
const Close = styled(IconButton)`position: absolute; top: 4px; inset-inline-end: 4px;`;

export default function PushOptInCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const support = pushSupport();
    if (support === 'unsupported' || readLocal().enabled || isDismissed()) return;
    if (support === 'supported' && Notification.permission !== 'default') return;
    setShow(true);
  }, []);

  if (!show) return null;
  return (
    <Card role="region" aria-label={HE.PUSH_CARD_TITLE}>
      <Bell aria-hidden="true"><LineIcon name="bell" size={21} /></Bell>
      <Text>
        <Title>{HE.PUSH_CARD_TITLE}</Title>
        <Body>{HE.PUSH_CARD_BODY}</Body>
      </Text>
      <Button $size="sm" onClick={() => { setShow(false); openNotifications(); }}>{HE.PUSH_CARD_CTA}</Button>
      <Close $size="sm" aria-label={HE.PUSH_CARD_DISMISS} onClick={() => { dismiss(); setShow(false); }}>
        <LineIcon name="close" size={16} />
      </Close>
    </Card>
  );
}
