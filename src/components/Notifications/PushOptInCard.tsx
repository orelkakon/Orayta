'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { openNotifications, pushSupport, readLocal } from '@/lib/push/client';

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
  position: relative; width: 100%; max-width: 520px; margin: 0 auto;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.ms} ${theme.spacing.md}; padding-inline-end: 40px;
  background: linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%);
  border: 1px solid ${theme.colors.borderLight}; border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.sm};
  animation: ${rise} 0.45s ${theme.motion.out} both;
`;
const Bell = styled.span`
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: ${theme.colors.secondary};
  background: radial-gradient(circle at 32% 28%, rgba(196,149,106,0.3), rgba(196,149,106,0.06));
  border: 1px solid rgba(196,149,106,0.5);
`;
const Text = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;
const Title = styled.div`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; font-weight: 800; color: ${theme.colors.primary};`;
const Body = styled.div`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; line-height: 1.45;`;
const Cta = styled.button`
  flex-shrink: 0; padding: 8px 14px; border-radius: 999px;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  font-size: ${theme.fontSizes.sm}; font-weight: 700;
  transition: transform ${theme.motion.fast} ${theme.motion.out};
  &:active { transform: scale(0.95); }
`;
const Close = styled.button`
  position: absolute; top: 6px; inset-inline-end: 6px; width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: ${theme.colors.textMuted};
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

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
      <Bell><LineIcon name="bell" size={20} /></Bell>
      <Text>
        <Title>{HE.PUSH_CARD_TITLE}</Title>
        <Body>{HE.PUSH_CARD_BODY}</Body>
      </Text>
      <Cta type="button" onClick={() => { setShow(false); openNotifications(); }}>{HE.PUSH_CARD_CTA}</Cta>
      <Close type="button" aria-label={HE.PUSH_CARD_DISMISS} onClick={() => { dismiss(); setShow(false); }}>
        <LineIcon name="close" size={14} />
      </Close>
    </Card>
  );
}
