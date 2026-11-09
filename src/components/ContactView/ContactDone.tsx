'use client';

import { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Button } from '@/components/ui/Button';
import { ContactSent } from './useContactForm';
import { Panel } from './contactStyles';

const draw = keyframes`to { stroke-dashoffset: 0; }`;
const ring = keyframes`from { transform: scale(0.4); opacity: 0; } to { transform: none; opacity: 1; }`;
const burst = keyframes`0% { transform: scale(0.6); opacity: 0.55; } 100% { transform: scale(1.9); opacity: 0; }`;

const Wrap = styled(Panel)`align-items: center; text-align: center; gap: ${theme.spacing.md}; padding-block: ${theme.spacing.xl};`;

const Badge = styled.div`
  position: relative; width: 88px; height: 88px;
  &::before {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: color-mix(in srgb, ${theme.colors.gold} 40%, transparent);
    animation: ${burst} 0.9s ${theme.motion.out} 0.25s both;
  }
  svg { position: relative; display: block; }
  circle { transform-box: fill-box; transform-origin: center; animation: ${ring} 0.5s ${theme.motion.spring} both; }
  path { stroke-dasharray: 40; stroke-dashoffset: 40; animation: ${draw} 0.45s ${theme.motion.outStrong} 0.3s forwards; }
  @media (prefers-reduced-motion: reduce) {
    &::before, circle { animation: none; }
    path { animation: none; stroke-dashoffset: 0; }
  }
`;

const Title = styled.h2`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h1}; font-weight: 800; color: ${theme.colors.primary};
  &:focus { outline: none; }
`;
const Body = styled.p`max-width: 420px; font-size: ${theme.fontSizes.md}; line-height: 1.7; color: ${theme.colors.textMuted};`;

const Quote = styled.figure`
  width: 100%; max-width: 460px; text-align: start;
  padding: ${theme.spacing.ms} ${theme.spacing.md}; border-radius: 14px;
  background: ${theme.colors.surfaceAlt}; border-inline-start: 3px solid ${theme.colors.gold};
  figcaption { font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.textMuted}; margin-bottom: 4px; }
  blockquote {
    font-size: ${theme.fontSizes.sm}; line-height: 1.7; color: ${theme.colors.text}; white-space: pre-wrap;
    display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;
  }
`;
const Again = styled.a`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.primary};
  text-decoration: underline; text-underline-offset: 3px; min-height: 36px; display: inline-flex; align-items: center;
`;

/** The thank-you state: a drawn check, what happens next, and what was sent. */
export default function ContactDone({ sent, onNew }: { sent: NonNullable<ContactSent>; onNew: () => void }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus(); }, []);
  const wa = sent.via === 'wa';

  return (
    <Wrap aria-live="polite">
      <Badge aria-hidden>
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="40" fill={wa ? theme.brand.whatsapp : theme.colors.gold} />
          <path d="M28 45.5l11 11 21-23" fill="none" stroke={wa ? theme.brand.whatsappText : theme.gilded.ink}
            strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Badge>
      <Title ref={title} tabIndex={-1}>{wa ? HE.CONTACT_DONE_WA_TITLE : HE.CONTACT_DONE_MAIL_TITLE}</Title>
      <Body>{wa ? HE.CONTACT_DONE_WA_BODY : HE.CONTACT_DONE_MAIL_BODY(sent.reply)}</Body>
      {wa && sent.href && <Again href={sent.href} target="_blank" rel="noopener noreferrer">{HE.CONTACT_DONE_WA_AGAIN}</Again>}
      <Quote>
        <figcaption>{HE.CONTACT_DONE_QUOTE}</figcaption>
        <blockquote>{sent.message}</blockquote>
      </Quote>
      <Button $variant="secondary" onClick={onNew}>{HE.CONTACT_NEW}</Button>
    </Wrap>
  );
}
