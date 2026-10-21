'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PushBroadcastRecord } from '@/types/push';
import BroadcastPreview from './BroadcastPreview';

/** Compose → preview → confirm → send a written notification to every subscriber. */
const Box = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.borderLight}; padding-top: ${theme.spacing.md};
`;
const H = styled.h3`margin: 0; font-size: ${theme.fontSizes.md}; color: ${theme.colors.primary};`;
const Label = styled.label`font-size: 0.8rem; font-weight: 600; color: ${theme.colors.textMuted};`;
const field = `
  width: 100%; padding: 10px 12px; border-radius: ${theme.radii.md};
  border: 2px solid ${theme.colors.border}; background: ${theme.colors.background};
  color: ${theme.colors.text}; font-family: ${theme.fonts.ui}; font-size: 0.95rem;
`;
const Input = styled.input`${field} &:focus { outline: none; border-color: ${theme.colors.primaryLight}; }`;
const Area = styled.textarea`${field} min-height: 84px; resize: vertical; &:focus { outline: none; border-color: ${theme.colors.primaryLight}; }`;
const Select = styled.select`${field}`;
const Meta = styled.div`display: flex; justify-content: space-between; font-size: 0.75rem; color: ${theme.colors.textMuted};`;
const Row = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap; align-items: center;`;
const Btn = styled.button<{ $primary?: boolean }>`
  padding: 10px 18px; border-radius: 999px; font-weight: 700; font-size: 0.9rem;
  background: ${({ $primary }) => ($primary ? theme.colors.primary : 'transparent')};
  color: ${({ $primary }) => ($primary ? theme.colors.onPrimary : theme.colors.primary)};
  border: 2px solid ${theme.colors.primary};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const Note = styled.div<{ $error?: boolean }>`
  font-size: 0.85rem; font-weight: 600;
  color: ${({ $error }) => ($error ? theme.colors.error : theme.colors.success)};
`;

const LINKS: [string, string][] = [
  ['/', HE.ADMIN_BC_LINK_HOME], ['/feed', HE.ADMIN_BC_LINK_FEED], ['/today', HE.ADMIN_BC_LINK_TODAY],
  ['/play', HE.ADMIN_BC_LINK_PLAY], ['/live', HE.ADMIN_BC_LINK_LIVE], ['/hilula', HE.ADMIN_BC_LINK_HILULA],
];
const BODY_MAX = 180;

export default function AdminBroadcast({ total }: { total: number }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('/');
  const [custom, setCustom] = useState('');
  const [step, setStep] = useState<'edit' | 'confirm' | 'sending'>('edit');
  const [note, setNote] = useState<{ text: string; error?: boolean } | null>(null);
  const [last, setLast] = useState<PushBroadcastRecord | null>(null);

  useEffect(() => {
    fetch('/api/push/broadcast').then(r => (r.ok ? r.json() : null))
      .then((d: { last: PushBroadcastRecord | null } | null) => setLast(d?.last ?? null)).catch(() => undefined);
  }, []);

  const url = link === 'custom' ? (custom.startsWith('/') ? custom : `/${custom}`) : link;
  const ready = body.trim().length >= 2 && total > 0;

  const send = async () => {
    setStep('sending'); setNote(null);
    const res = await fetch('/api/push/broadcast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), body: body.trim(), url }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) as { sent?: number; failed?: number } | null : null;
    setStep('edit');
    if (res?.status === 429) { setNote({ text: HE.ADMIN_BC_TOO_SOON, error: true }); return; }
    if (!res?.ok || !data) { setNote({ text: HE.ADMIN_BC_ERROR, error: true }); return; }
    setNote({ text: HE.ADMIN_BC_DONE(data.sent ?? 0, data.failed ?? 0) });
    setLast({ at: new Date().toISOString(), title: title.trim() || HE.APP_NAME, body: body.trim(), url, sent: data.sent ?? 0, failed: data.failed ?? 0 });
    setBody(''); setTitle('');
  };

  return (
    <Box>
      <H>{HE.ADMIN_BC_TITLE}</H>
      {total === 0 && <Meta>{HE.ADMIN_BC_NONE}</Meta>}
      <Label htmlFor="bc-title">{HE.ADMIN_BC_HEADLINE}</Label>
      <Input id="bc-title" value={title} maxLength={50} placeholder={HE.APP_NAME} onChange={e => setTitle(e.target.value)} />
      <Label htmlFor="bc-body">{HE.ADMIN_BC_TEXT}</Label>
      <Area id="bc-body" value={body} maxLength={BODY_MAX} placeholder={HE.ADMIN_BC_TEXT_PH}
        onChange={e => { setBody(e.target.value); setStep('edit'); }} />
      <Meta><span /><span>{body.length}/{BODY_MAX}</span></Meta>
      <Label htmlFor="bc-link">{HE.ADMIN_BC_LINK}</Label>
      <Select id="bc-link" value={link} onChange={e => setLink(e.target.value)}>
        {LINKS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        <option value="custom">{HE.ADMIN_BC_LINK_CUSTOM}</option>
      </Select>
      {link === 'custom' && <Input dir="ltr" value={custom} placeholder={HE.ADMIN_BC_LINK_PH} onChange={e => setCustom(e.target.value)} />}
      {body.trim() && <BroadcastPreview title={title.trim() || HE.APP_NAME} body={body.trim()} />}
      {step === 'confirm' ? (
        <Row>
          <Meta>{HE.ADMIN_BC_CONFIRM(total)}</Meta>
          <Btn $primary type="button" onClick={() => { void send(); }}>{HE.ADMIN_BC_YES}</Btn>
          <Btn type="button" onClick={() => setStep('edit')}>{HE.CANCEL}</Btn>
        </Row>
      ) : (
        <Row>
          <Btn $primary type="button" disabled={!ready || step === 'sending'} onClick={() => setStep('confirm')}>
            {step === 'sending' ? HE.ADMIN_BC_SENDING : HE.ADMIN_BC_SEND(total)}
          </Btn>
        </Row>
      )}
      {note && <Note $error={note.error} role="status">{note.text}</Note>}
      {last && <Meta>{HE.ADMIN_BC_LAST(new Date(last.at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }), last.sent)}</Meta>}
    </Box>
  );
}
