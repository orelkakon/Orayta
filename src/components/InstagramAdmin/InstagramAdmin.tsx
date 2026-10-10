'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import type { InstagramPage } from '@/types';
import ReelsAdminCard from './ReelsAdminCard';
import PageRow from './PageRow';
import { Card, CardTitle, FormRow, Input, SaveBtn, List, Muted, Empty } from './adminStyles';

const Wrap = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.lg}; padding: ${theme.spacing.lg} ${theme.spacing.md};
`;

const PageTitle = styled.h2`
  font-size: 1.3rem; font-weight: 700; color: ${theme.colors.primary};
`;

const PageSub = styled.p`font-size: 0.85rem; color: ${theme.colors.textMuted};`;

const BackLink = styled(Link)`
  font-size: 0.85rem; color: ${theme.colors.primaryLight}; font-weight: 600;
`;

export default function InstagramAdmin() {
  const role = useRole();
  const [pages, setPages]           = useState<InstagramPage[]>([]);
  const [maxSeconds, setMaxSeconds] = useState('60');
  const [savingCfg, setSavingCfg]   = useState(false);
  const [cfgSaved, setCfgSaved]     = useState(false);
  const [reelsVersion, setReelsVersion] = useState(0);

  const loadPages = useCallback(() => {
    void fetch('/api/instagram/pages')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setPages(data as InstagramPage[]); })
      .catch(() => {});
  }, []);

  // After a backfill: refresh page counts and the reels list below.
  const onPagesChanged = useCallback(() => {
    loadPages();
    setReelsVersion(v => v + 1);
  }, [loadPages]);

  useEffect(() => {
    if (role !== 'admin') return;
    loadPages();
    void fetch('/api/instagram/config')
      .then(r => r.json())
      .then((d: { maxSeconds: number }) => setMaxSeconds(String(d.maxSeconds)))
      .catch(() => {});
  }, [role, loadPages]);

  if (role !== 'admin') {
    return <Wrap><PageTitle>{HE.IG_ADMIN_FORBIDDEN}</PageTitle></Wrap>;
  }

  const handleTogglePage = async (id: string) => {
    await fetch(`/api/instagram/pages/${id}`, { method: 'PATCH' });
    loadPages();
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm(HE.IG_ADMIN_DELETE_PAGE_CONFIRM)) return;
    await fetch(`/api/instagram/pages/${id}`, { method: 'DELETE' });
    loadPages();
  };

  const handleSaveCfg = async () => {
    setSavingCfg(true);
    const res = await fetch('/api/instagram/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxSeconds: Number(maxSeconds) }),
    });
    setSavingCfg(false);
    if (res.ok) { setCfgSaved(true); setTimeout(() => setCfgSaved(false), 1800); }
  };

  return (
    <Wrap>
      <PageTitle>🎬 {HE.IG_ADMIN_TITLE}</PageTitle>
      <PageSub>{HE.IG_ADMIN_SUBTITLE}</PageSub>

      <Card>
        <CardTitle>⏱️ {HE.IG_ADMIN_MAX_SECONDS}</CardTitle>
        <FormRow>
          <Input type="number" min={10} max={600} value={maxSeconds} onChange={e => setMaxSeconds(e.target.value)} />
          <SaveBtn onClick={handleSaveCfg} disabled={savingCfg}>
            {cfgSaved ? HE.IG_ADMIN_SAVED : HE.IG_ADMIN_SAVE}
          </SaveBtn>
        </FormRow>
        <Muted>{HE.IG_ADMIN_MAX_SECONDS_NOTE}</Muted>
      </Card>

      <Card>
        <CardTitle>📷 {HE.IG_ADMIN_PAGES_TITLE}</CardTitle>
        <Muted>{HE.IG_ADMIN_PAGES_NOTE}</Muted>
        {pages.length === 0
          ? <Empty>{HE.IG_ADMIN_EMPTY_PAGES}</Empty>
          : (
            <List>
              {pages.map(p => (
                <PageRow
                  key={p.id}
                  page={p}
                  onToggle={() => void handleTogglePage(p.id)}
                  onDelete={() => void handleDeletePage(p.id)}
                  onChanged={onPagesChanged}
                />
              ))}
            </List>
          )}
      </Card>

      <ReelsAdminCard pages={pages} onChanged={loadPages} refreshKey={reelsVersion} />
      <BackLink href="/feed">{HE.IG_ADMIN_BACK}</BackLink>
    </Wrap>
  );
}
