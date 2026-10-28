'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { RabbiBotSource } from '@/types/rabbiBot';
import { LinkBtn } from './styles';

const Wrap = styled.article`
  scroll-margin-top: 80px;
  border: 1px solid ${theme.colors.borderLight}; border-radius: ${theme.radii.md};
  background: ${theme.colors.surface}; padding: ${theme.spacing.ms} ${theme.spacing.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  &:target, &[data-flash='1'] { border-color: ${theme.colors.secondary}; box-shadow: 0 0 0 3px rgba(196,149,106,0.25); }
`;

const Head = styled.div`display: flex; align-items: baseline; gap: ${theme.spacing.sm};`;
const Num = styled.span`
  min-width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: ${theme.fontSizes.xs}; font-weight: 800;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
`;
const Ref = styled.h4`margin: 0; font-size: ${theme.fontSizes.sm}; font-weight: 800; color: ${theme.colors.primary};`;

const Body = styled.p`
  margin: 0; font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; line-height: 1.75;
  color: ${theme.colors.text};
  & mark { background: ${theme.colors.bgWarning}; color: inherit; border-radius: 3px; padding: 0 2px; }
`;

const Foot = styled.div`display: flex; justify-content: space-between; align-items: center; gap: ${theme.spacing.sm};`;
const Open = styled.a`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondary};
  text-decoration: none; &:hover { text-decoration: underline; }
`;

const AROUND = 180;

/** Splits `text` into plain / highlighted runs for every quote found in it. */
function marks(text: string, quotes: string[]): { t: string; on: boolean }[] {
  const ranges = quotes
    .map(q => { const at = text.indexOf(q); return at >= 0 ? [at, at + q.length] as const : null; })
    .filter((r): r is readonly [number, number] => r !== null)
    .sort((a, b) => a[0] - b[0]);
  const out: { t: string; on: boolean }[] = [];
  let pos = 0;
  ranges.forEach(([a, b]) => {
    if (a < pos) return;
    if (a > pos) out.push({ t: text.slice(pos, a), on: false });
    out.push({ t: text.slice(a, b), on: true });
    pos = b;
  });
  if (pos < text.length) out.push({ t: text.slice(pos), on: false });
  return out;
}

interface Props { index: number; source: RabbiBotSource; quotes: string[]; domId: string }

export default function SourceCard({ index, source, quotes, domId }: Props) {
  const [open, setOpen] = useState(false);
  const flat = source.text.replace(/\s+/g, ' ');
  const first = quotes.map(q => flat.indexOf(q)).filter(i => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const long = flat.length > AROUND * 3;
  const from = open || !long ? 0 : Math.max(0, first - AROUND);
  const to = open || !long ? flat.length : Math.min(flat.length, first + AROUND * 2);
  const shown = flat.slice(from, to);

  return (
    <Wrap id={domId}>
      <Head><Num>{index + 1}</Num><Ref>{source.heRef}</Ref></Head>
      <Body>
        {from > 0 && '… '}
        {marks(shown, quotes).map((r, i) => (r.on ? <mark key={i}>{r.t}</mark> : <span key={i}>{r.t}</span>))}
        {to < flat.length && ' …'}
      </Body>
      <Foot>
        <Open href={source.url} target="_blank" rel="noopener noreferrer">
          {source.origin === 'wikisource' ? HE.RB_OPEN_WIKISOURCE : HE.RB_OPEN_SEFARIA} ↗
        </Open>
        {long && <LinkBtn type="button" onClick={() => setOpen(o => !o)}>{open ? HE.RB_SHOW_LESS : HE.RB_SHOW_MORE}</LinkBtn>}
      </Foot>
    </Wrap>
  );
}
