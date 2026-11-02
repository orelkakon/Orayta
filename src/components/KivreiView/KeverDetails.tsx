'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Kever } from '@/lib/kivrei/types';

const About = styled.p<{ $open: boolean }>`
  font-size: ${theme.fontSizes.sm}; line-height: 1.75; color: ${theme.colors.text};
  ${p => (p.$open ? '' : `
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  `)}
`;

const From = styled.span`font-size: 0.68rem; color: ${theme.colors.textLight};`;

const More = styled.button`
  align-self: flex-start; font-size: ${theme.fontSizes.xs}; font-weight: 700;
  color: ${theme.colors.primaryLight}; text-decoration: underline; text-underline-offset: 2px;
`;

const Info = styled.div`
  background: ${theme.colors.surfaceAlt}; border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.ms};
  display: flex; flex-direction: column; gap: 4px;
  font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.text};
  b { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; margin-inline-end: 6px; }
`;

const Unknown = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;

const Links = styled.div`
  display: flex; flex-wrap: wrap; gap: ${theme.spacing.ms};
  a { font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.primaryLight}; text-decoration: underline; text-underline-offset: 2px; }
`;

/** Who was he, visiting info (only what's published) and further reading. */
export default function KeverDetails({ k }: { k: Kever }) {
  const [open, setOpen] = useState(false);
  const long = (k.about?.length ?? 0) > 160;

  return (
    <>
      {k.about && (
        <>
          <About $open={open || !long}>{k.about}</About>
          {long && (
            <More onClick={() => setOpen(o => !o)} aria-expanded={open}>{open ? HE.KV_READ_LESS : HE.KV_READ_MORE}</More>
          )}
          {k.aboutFrom && <From>{HE.KV_ABOUT_FROM[k.aboutFrom]}</From>}
        </>
      )}

      <Info>
        {k.hours
          ? <span><b>{HE.KV_HOURS}</b><span dir="ltr">{k.hours}</span></span>
          : <Unknown>{HE.KV_HOURS_UNKNOWN}</Unknown>}
        {k.note && <span><b>{HE.KV_DIRECTIONS}</b>{k.note}</span>}
        {k.wheelchair && HE.KV_WHEELCHAIR[k.wheelchair] && <span>♿ {HE.KV_WHEELCHAIR[k.wheelchair]}</span>}
      </Info>

      {(k.personUrl || k.siteUrl || k.osmUrl) && (
        <Links>
          {k.personUrl && <a href={k.personUrl} target="_blank" rel="noopener noreferrer">{HE.KV_WIKI_PERSON} ↗</a>}
          {k.siteUrl && <a href={k.siteUrl} target="_blank" rel="noopener noreferrer">{HE.KV_WIKI_SITE} ↗</a>}
          {k.osmUrl && <a href={k.osmUrl} target="_blank" rel="noopener noreferrer">{HE.KV_OSM_LINK} ↗</a>}
        </Links>
      )}
    </>
  );
}
