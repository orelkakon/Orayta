'use client';

import { useEffect, useState, useCallback } from 'react';
import { HE } from '@/lib/hebrewTexts';
import type { LiveChannel } from '@/types';
import {
  Card, CardTitle, FormRow, Input, SaveBtn, List, Row, RowText, Muted, Actions, SmallBtn, DelBtn, Empty,
} from '@/components/InstagramAdmin/adminStyles';

/** Admin: manage the YouTube channels the live section follows. */
export default function LiveAdminCard({ onChanged }: { onChanged: () => void }) {
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [url, setUrl]           = useState('');
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(() => {
    void fetch('/api/live/channels?all=1')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setChannels(data as LiveChannel[]); })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { load(); onChanged(); };

  const handleAdd = async () => {
    if (!url.trim() || busy) return;
    setBusy(true); setError('');
    const res = await fetch('/api/live/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    setBusy(false);
    if (res.ok) { setUrl(''); refresh(); return; }
    setError(res.status === 409 ? HE.LIVE_ADMIN_DUPLICATE : HE.LIVE_ADMIN_INVALID);
  };

  const handleToggle = async (id: string) => {
    await fetch(`/api/live/channels/${id}`, { method: 'PATCH' });
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(HE.LIVE_ADMIN_DELETE_CONFIRM)) return;
    await fetch(`/api/live/channels/${id}`, { method: 'DELETE' });
    refresh();
  };

  return (
    <Card>
      <CardTitle>📡 {HE.LIVE_ADMIN_TITLE}</CardTitle>
      <Muted>{HE.LIVE_ADMIN_NOTE}</Muted>
      <FormRow>
        <Input
          type="url"
          placeholder={HE.LIVE_ADMIN_PLACEHOLDER}
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') void handleAdd(); }}
        />
        <SaveBtn onClick={() => void handleAdd()} disabled={busy || !url.trim()}>
          {busy ? '…' : HE.IG_ADMIN_ADD}
        </SaveBtn>
      </FormRow>
      {error && <Muted role="alert">{error}</Muted>}
      {channels.length === 0
        ? <Empty>{HE.LIVE_ADMIN_EMPTY}</Empty>
        : (
          <List>
            {channels.map(c => (
              <Row key={c.id} $off={!c.active}>
                <RowText>{c.name}</RowText>
                <Actions>
                  <SmallBtn onClick={() => void handleToggle(c.id)}>
                    {c.active ? HE.IG_ADMIN_ACTIVE : HE.IG_ADMIN_INACTIVE}
                  </SmallBtn>
                  <DelBtn onClick={() => void handleDelete(c.id)}>✕</DelBtn>
                </Actions>
              </Row>
            ))}
          </List>
        )}
    </Card>
  );
}
