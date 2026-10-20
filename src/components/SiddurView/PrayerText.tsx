'use client';

import { memo } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';

// Sizes scale with --siddur-scale (the reader's font control).
const Para = styled.p`
  font-family: ${theme.fonts.body};
  font-size: calc(1.05rem * var(--siddur-scale, 1.22));
  line-height: 2.05;
  color: ${theme.colors.text};
  margin: 0 0 0.85em;
  text-wrap: pretty;
  big { font-size: 1.3em; font-weight: 700; }
  b { color: ${theme.colors.primary}; font-weight: 700; }
  small {
    display: block; margin: 0.3em 0;
    font-family: ${theme.fonts.ui}; font-size: max(0.78rem, 0.62em); line-height: 1.6;
    color: ${theme.colors.textMuted};
  }
`;

// A paragraph that is only an instruction ("אומר החזן חצי קדיש").
const Instruction = styled.p`
  font-family: ${theme.fonts.ui};
  font-size: calc(0.8rem * var(--siddur-scale, 1.22));
  line-height: 1.6;
  color: ${theme.colors.textMuted};
  margin: 0.4em 0 0.5em;
  padding-inline-start: 10px;
  border-inline-start: 2px solid ${theme.colors.borderLight};
  small, big, b { font: inherit; color: inherit; }
`;

const Heading = styled.p`
  font-family: ${theme.fonts.body};
  font-size: calc(1.08rem * var(--siddur-scale, 1.22));
  font-weight: 700;
  color: ${theme.colors.primary};
  margin: 1em 0 0.4em;
  big { font-size: 1em; }
`;

const isInstruction = (html: string) => /^<small>[\s\S]*<\/small>$/.test(html) && !/<\/small>[\s\S]*<small>/.test(html);
const isHeading = (html: string) => html.startsWith('<big>') && html.replace(/<[^>]+>/g, '').length < 40;

/** Renders sanitized Sefaria segments (sanitized server-side in /api/siddur). */
function PrayerText({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((html, i) => {
        if (!html) return null;
        const Comp = isInstruction(html) ? Instruction : isHeading(html) ? Heading : Para;
        return <Comp key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </>
  );
}

export default memo(PrayerText);
