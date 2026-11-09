'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { TehillimState } from '@/types/tehillim';
import { forgetCircle, manageUrl } from '@/lib/tehillim/client';
import { NOTE_MAX } from '@/lib/tehillim/rules';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CircleApi } from '../useCircle';
import { Section, SectionTitle, Muted } from '../styles';

/**
 * The organizer's controls (only with the organizer key on this device):
 * update the note, close / reopen, move management to another phone, delete.
 */
const Col = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Area = styled.textarea`
  min-height: 84px; padding: ${theme.spacing.sm} ${theme.spacing.ms}; border-radius: ${theme.radii.md}; resize: vertical;
  font-family: ${theme.fonts.ui}; font-size: 16px; line-height: 1.5;
  border: 1px solid ${theme.colors.border}; background: ${theme.colors.surface}; color: ${theme.colors.text};
`;
const Row = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;
const Danger = styled.p`margin: 0; font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.error};`;

export default function ManagePanel({ state, api }: { state: TehillimState; api: CircleApi }) {
  const router = useRouter();
  const [note, setNote] = useState(state.note ?? '');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(false);
  const [copied, setCopied] = useState(false);

  const patch = async (body: object) => {
    setBusy(true);
    const r = await api.manage(body);
    setBusy(false);
    return r.ok;
  };
  const remove = async () => {
    setBusy(true);
    const r = await api.remove();
    setBusy(false);
    if (r.ok) { forgetCircle(state.slug); router.replace('/tehillim'); }
  };

  return (
    <Section aria-labelledby="th-manage">
      <SectionTitle id="th-manage">{HE.TH_MANAGE_TITLE}</SectionTitle>
      <Card $pad="md" $tone="alt">
        <Col>
          <Muted>{HE.TH_MANAGE_SUB}</Muted>
          <label htmlFor="th-note"><Muted>{HE.TH_MANAGE_NOTE}</Muted></label>
          <Area id="th-note" value={note} maxLength={NOTE_MAX} placeholder={HE.TH_NOTE_PH} onChange={e => { setNote(e.target.value); setSaved(false); }} />
          <Row>
            <Button $variant="primary" $size="sm" disabled={busy || note === (state.note ?? '')}
              onClick={() => { void patch({ note }).then(ok => setSaved(ok)); }}>{saved ? `✓ ${HE.TH_MANAGE_SAVED}` : HE.TH_MANAGE_SAVE}</Button>
            <Button $variant="secondary" $size="sm" disabled={busy} onClick={() => { void patch({ closed: !state.closed }); }}>
              {state.closed ? HE.TH_MANAGE_REOPEN : HE.TH_MANAGE_CLOSE}
            </Button>
            {api.manageKey && (
              <Button $variant="tonal" $size="sm" onClick={() => {
                void navigator.clipboard?.writeText(manageUrl(state.slug, api.manageKey as string)).then(() => setCopied(true));
              }}>{copied ? `✓ ${HE.TH_SHARE_COPIED}` : HE.TH_MANAGE_LINK}</Button>
            )}
          </Row>
          <Muted>{HE.TH_MANAGE_LINK_HINT}</Muted>
          {ask ? (
            <Col>
              <Danger>{HE.TH_MANAGE_DELETE_ASK}</Danger>
              <Row>
                <Button $variant="danger" $size="sm" disabled={busy} onClick={() => void remove()}>{HE.TH_MANAGE_DELETE_YES}</Button>
                <Button $variant="ghost" $size="sm" onClick={() => setAsk(false)}>{HE.CLOSE}</Button>
              </Row>
            </Col>
          ) : (
            <Row><Button $variant="ghost" $size="sm" onClick={() => setAsk(true)}>{HE.TH_MANAGE_DELETE}</Button></Row>
          )}
        </Col>
      </Card>
    </Section>
  );
}
