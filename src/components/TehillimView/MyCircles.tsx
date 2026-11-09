'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { TehillimState } from '@/types/tehillim';
import { forgetCircle, myCircles, thFetch, type MyCircle } from '@/lib/tehillim/client';
import { CardLink } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Section, SectionTitle, Muted } from './styles';

/** The readings this device opened or joined, each with its live progress (deleted ones drop out). */
const List = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Top = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;
const Name = styled.span`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text};`;
const Track = styled.div`margin-top: ${theme.spacing.sm}; height: 6px; border-radius: 3px; background: ${theme.colors.borderLight}; overflow: hidden;`;
const Fill = styled.div`height: 100%; border-radius: 3px; background: ${theme.gilded.fill};`;
const Meta = styled.p`margin: 6px 0 0; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;

export default function MyCircles() {
  const [items, setItems] = useState<MyCircle[] | null>(null);
  const [live, setLive] = useState<Record<string, TehillimState>>({});

  useEffect(() => {
    const list = myCircles();
    setItems(list);
    list.slice(0, 8).forEach(c => {
      void thFetch<TehillimState>(`/api/tehillim/${c.slug}`, { manageKey: c.manageKey }).then(r => {
        if (r.ok) setLive(prev => ({ ...prev, [c.slug]: r.data }));
        else if (r.status === 404) { forgetCircle(c.slug); setItems(prev => prev?.filter(x => x.slug !== c.slug) ?? null); }
      });
    });
  }, []);

  if (!items) return null;
  return (
    <Section aria-labelledby="th-mine">
      <SectionTitle id="th-mine">{HE.TH_MINE_TITLE}</SectionTitle>
      {items.length === 0 ? <Muted>{HE.TH_MINE_EMPTY}</Muted> : (
        <List>
          {items.map(c => {
            const s = live[c.slug];
            const done = s ? s.cells.filter(x => x === 'done').length : 0;
            return (
              <CardLink key={c.slug} href={`/tehillim/${c.slug}`} $interactive $pad="md">
                <Top>
                  <Name>{c.heading || c.slug}</Name>
                  {c.manageKey && <Badge $tone="gold">{HE.TH_MINE_ORGANIZER}</Badge>}
                </Top>
                {s && (
                  <>
                    <Track><Fill style={{ width: `${Math.round((done / s.units) * 100)}%` }} /></Track>
                    <Meta>{HE.TH_ROUND(s.round)} · {s.stats.chapters} {HE.TH_STAT_CHAPTERS} · {s.stats.readers} {HE.TH_STAT_READERS}{s.closed ? ` · ${HE.TH_CLOSED}` : ''}</Meta>
                  </>
                )}
              </CardLink>
            );
          })}
        </List>
      )}
    </Section>
  );
}
