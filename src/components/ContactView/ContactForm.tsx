'use client';

import { useRef } from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { CONTACT_LIMITS, CONTACT_TOPICS } from '@/lib/contact';
import { Chip } from '@/components/ui/Chip';
import { Button, ButtonAnchor } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';
import { useAutoGrow } from '@/components/common/useAutoGrow';
import { ShareGlyphs } from '@/components/AboutView/shareGlyphs';
import RatingStars from './RatingStars';
import { ContactForm as Form } from './useContactForm';
import { Counter, Field, Hint, Honeypot, Input, Label, LabelRow, Pair, Panel, Textarea } from './contactStyles';

const spin = keyframes`to { transform: rotate(360deg); }`;

const Topics = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;

const Actions = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr); gap: ${theme.spacing.sm}; align-items: center;
  ${theme.up.sm} { grid-template-columns: minmax(0, 1.3fr) auto minmax(0, 1fr); }
`;
const Or = styled.span`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textLight};
  &::before, &::after { content: ''; flex: 1; height: 1px; background: ${theme.colors.borderLight}; }
  ${theme.up.sm} { &::before, &::after { display: none; } }
`;
const Wa = styled(ButtonAnchor)`
  background: ${theme.brand.whatsapp}; color: ${theme.brand.whatsappText};
  box-shadow: 0 6px 16px -8px ${theme.brand.whatsapp};
`;
const Spinner = styled.span`
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid currentColor; border-inline-end-color: transparent;
  animation: ${spin} 0.7s linear infinite;
`;
const Alert = styled.div`
  display: flex; gap: ${theme.spacing.sm}; align-items: flex-start;
  padding: ${theme.spacing.ms} ${theme.spacing.md}; border-radius: 14px;
  background: ${theme.colors.bgError}; color: ${theme.colors.error};
  font-size: ${theme.fontSizes.sm}; line-height: 1.6;
  svg { flex-shrink: 0; margin-top: 3px; }
  a { font-weight: 700; text-decoration: underline; }
`;
const Fine = styled.p`
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; text-align: center;
  a { color: ${theme.colors.primary}; text-decoration: underline; text-underline-offset: 2px; }
`;

const ERRORS = { required: HE.CONTACT_MESSAGE_REQUIRED, rate: HE.CONTACT_ERR_RATE, mail: HE.CONTACT_ERR_MAIL, generic: HE.CONTACT_ERR_GENERIC };

export default function ContactForm({ f }: { f: Form }) {
  const area = useRef<HTMLTextAreaElement>(null);
  useAutoGrow(area, f.message);
  const len = f.message.length;
  const mailto = `mailto:${HE.ABOUT_CREATOR_EMAIL}?body=${encodeURIComponent(f.message)}`;

  return (
    <Panel $i={1} aria-label={HE.CONTACT_PAGE_TITLE}>
      <Field role="group" aria-labelledby="ct-topic">
        <Label as="span" id="ct-topic">{HE.CONTACT_TOPIC_LABEL}<em>{HE.CONTACT_OPTIONAL}</em></Label>
        <Topics>
          {CONTACT_TOPICS.map(t => (
            <Chip key={t} $selected={f.topic === t} aria-pressed={f.topic === t}
              onClick={() => f.setTopic(f.topic === t ? null : t)}>{HE.CONTACT_TOPICS[t]}</Chip>
          ))}
        </Topics>
      </Field>

      <Field>
        <LabelRow>
          <Label htmlFor="ct-msg">{HE.CONTACT_MESSAGE_LABEL}</Label>
          <Counter $near={len > CONTACT_LIMITS.message * 0.9} aria-hidden>{HE.CONTACT_COUNTER(len, CONTACT_LIMITS.message)}</Counter>
        </LabelRow>
        <Textarea ref={area} id="ct-msg" value={f.message} onChange={e => f.setMessage(e.target.value)}
          placeholder={HE.CONTACT_MESSAGE_PH[f.topic ?? 'other']} maxLength={CONTACT_LIMITS.message}
          aria-invalid={f.error === 'required'} aria-describedby={f.error ? 'ct-err' : undefined} />
      </Field>

      <Pair>
        <Field>
          <Label htmlFor="ct-name">{HE.CONTACT_NAME_LABEL}<em>{HE.CONTACT_OPTIONAL}</em></Label>
          <Input id="ct-name" value={f.name} onChange={e => f.setName(e.target.value)} placeholder={HE.CONTACT_NAME_PH}
            maxLength={CONTACT_LIMITS.name} autoComplete="name" enterKeyHint="next" />
        </Field>
        <Field>
          <Label htmlFor="ct-reply">{HE.CONTACT_REPLY_LABEL}<em>{HE.CONTACT_OPTIONAL}</em></Label>
          <Input id="ct-reply" value={f.replyTo} onChange={e => f.setReplyTo(e.target.value)} placeholder={HE.CONTACT_REPLY_PH}
            maxLength={CONTACT_LIMITS.replyTo} autoComplete="email" inputMode="email" dir="auto" aria-describedby="ct-reply-hint" />
          <Hint id="ct-reply-hint">{HE.CONTACT_REPLY_HINT}</Hint>
        </Field>
      </Pair>

      <Field>
        <Label as="span" id="ct-rate">{HE.CONTACT_RATING_LABEL}<em>{HE.CONTACT_OPTIONAL}</em></Label>
        <RatingStars value={f.rating} onChange={f.setRating} labelId="ct-rate" />
      </Field>

      <Honeypot tabIndex={-1} autoComplete="off" aria-hidden name="website" value={f.website} onChange={e => f.setWebsite(e.target.value)} />

      {f.error && (
        <Alert id="ct-err" role="alert">
          <LineIcon name="info" size={18} />
          <span>
            {ERRORS[f.error]}
            {f.error === 'mail' && <> <a href={mailto}>{HE.CONTACT_ERR_MAILTO}</a></>}
          </span>
        </Alert>
      )}

      <Actions>
        <Button $variant="gold" $size="lg" $block onClick={f.sendMail} disabled={f.busy} aria-busy={f.busy}>
          {f.busy ? <Spinner aria-hidden /> : <LineIcon name="send" size={19} strokeWidth={1.9} />}
          {f.busy ? HE.CONTACT_SENDING : HE.CONTACT_SEND}
        </Button>
        <Or>{HE.CONTACT_OR}</Or>
        <Wa $size="lg" $block href={f.waHref ?? '#'} target="_blank" rel="noopener noreferrer" onClick={f.sendWa}
          aria-disabled={f.busy || undefined}>
          {ShareGlyphs.whatsapp}{HE.CONTACT_SEND_WA}
        </Wa>
      </Actions>

      <Fine>{HE.CONTACT_PRIVACY} <Link href="/legal#privacy">{HE.CONTACT_PRIVACY_LINK}</Link></Fine>
    </Panel>
  );
}
