'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import type { GabbaiContact } from '@/types/minyan';
import { Field, Input, PrimaryBtn, Muted, ErrorText } from './minyanStyles';

const Body = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const PhoneInput = styled(Input)`direction: ltr; text-align: right;`;

interface Props {
  placeId: string;
  placeName: string;
  current: GabbaiContact | null;
  onClose: () => void;
  onDone: (gabbai: GabbaiContact | null) => void;
}

/** Admin-only: publish (or clear) a verified gabbai contact for a synagogue. */
export default function GabbaiModal({ placeId, placeName, current, onClose, onDone }: Props) {
  const [name, setName] = useState(current?.name ?? '');
  const [phone, setPhone] = useState(current?.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(false);
    try {
      const res = await fetch('/api/minyan/contacts', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, name, phone }),
      });
      if (!res.ok) { setError(true); return; }
      const { gabbai } = await res.json() as { gabbai: GabbaiContact | null };
      onDone(gabbai);
      onClose();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={HE.MN_GABBAI_EDIT} onClose={onClose}>
      <Body as="form" onSubmit={save}>
        <Muted>{placeName}</Muted>
        <Field>{HE.MN_GABBAI_NAME}<Input value={name} onChange={e => setName(e.target.value)} maxLength={80} /></Field>
        <Field>
          {HE.MN_GABBAI_PHONE}
          <PhoneInput type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={20} />
        </Field>
        <Muted>{HE.MN_GABBAI_NOTE}</Muted>
        {error && <ErrorText role="alert">{HE.MN_GABBAI_ERROR}</ErrorText>}
        <PrimaryBtn type="submit" disabled={busy}>{HE.MN_GABBAI_SAVE}</PrimaryBtn>
      </Body>
    </Modal>
  );
}
