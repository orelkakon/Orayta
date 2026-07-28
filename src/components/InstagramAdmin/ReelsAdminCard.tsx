'use client';

import { useState, useEffect, useCallback } from 'react';
import { HE } from '@/lib/hebrewTexts';
import type { InstagramPage, InstagramReel } from '@/types';
import { Card, CardTitle, FormRow, Input, Select, SaveBtn, List, Row, RowText, Muted, Actions, SmallBtn, DelBtn, Empty } from './adminStyles';

interface Props {
  pages: InstagramPage[];
  onChanged: () => void;
}

export default function ReelsAdminCard({ pages, onChanged }: Props) {
  const [reels, setReels]     = useState<InstagramReel[]>([]);
  const [url, setUrl]         = useState('');
  const [pageId, setPageId]   = useState('');
  const [saving, setSaving]   = useState(false);

  const load = useCallback(() => {
    void fetch('/api/instagram/reels?all=1')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setReels(data as InstagramReel[]); })
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!url.trim() || saving) return;
    setSaving(true);
    const res = await fetch('/api/instagram/reels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [url.trim()], pageId: pageId || undefined }),
    });
    setSaving(false);
    if (!res.ok) { window.alert(HE.IG_ADMIN_INVALID_LINK); return; }
    setUrl(''); load(); onChanged();
  };

  const handleToggle = async (id: string) => {
    await fetch(`/api/instagram/reels/${id}`, { method: 'PATCH' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(HE.IG_ADMIN_DELETE_REEL_CONFIRM)) return;
    await fetch(`/api/instagram/reels/${id}`, { method: 'DELETE' });
    load(); onChanged();
  };

  return (
    <Card>
      <CardTitle>🎥 {HE.IG_ADMIN_REELS_TITLE} {reels.length > 0 && <Muted>({reels.length})</Muted>}</CardTitle>
      <FormRow>
        <Select value={pageId} onChange={e => setPageId(e.target.value)}>
          <option value="">{HE.IG_ADMIN_NO_PAGE}</option>
          {pages.map(p => <option key={p.id} value={p.id}>@{p.username}</option>)}
        </Select>
        <Input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={HE.IG_ADMIN_REEL_PLACEHOLDER}
          onKeyDown={e => e.key === 'Enter' && void handleAdd()}
        />
        <SaveBtn onClick={handleAdd} disabled={saving || !url.trim()}>
          {saving ? '...' : HE.IG_ADMIN_ADD}
        </SaveBtn>
      </FormRow>
      {reels.length === 0
        ? <Empty>{HE.IG_ADMIN_EMPTY_REELS}</Empty>
        : (
          <List>
            {reels.map(r => (
              <Row key={r.id} $off={!r.active}>
                <RowText>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.code}</a>
                  {' '}<Muted>{r.username ? `@${r.username}` : HE.IG_ADMIN_NO_PAGE}</Muted>
                </RowText>
                <Actions>
                  <SmallBtn onClick={() => void handleToggle(r.id)}>
                    {r.active ? HE.IG_ADMIN_ACTIVE : HE.IG_ADMIN_INACTIVE}
                  </SmallBtn>
                  <DelBtn onClick={() => void handleDelete(r.id)}>✕</DelBtn>
                </Actions>
              </Row>
            ))}
          </List>
        )}
    </Card>
  );
}
