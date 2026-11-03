'use client';

import { memo } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * Prayer/text typography shared by the siddur and every prayers-hub reader.
 * Sizes scale with --siddur-scale (the reader's text-size setting); the text
 * column is capped at a comfortable reading measure and centred.
 */
export const ReadingColumn = styled.div`
  max-width: ${theme.layout.reading};
  margin-inline: auto;
`;

/* Jump targets land below the sticky header + reader bar. */
const anchor = `scroll-margin-top: calc(var(--header-h, 56px) + 72px);`;

const Para = styled.p`
  ${anchor}
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
    color: ${theme.colors.secondaryText};
  }
`;

/* An instruction ("אומר החזן חצי קדיש"): a quiet gold-tinted note, clearly
   not part of the prayer text. */
const Instruction = styled.p`
  ${anchor}
  font-family: ${theme.fonts.ui};
  font-size: calc(0.8rem * var(--siddur-scale, 1.22));
  font-weight: 500; line-height: 1.6;
  color: ${theme.colors.secondaryText};
  margin: 0.5em 0 0.7em;
  padding: 0.45em 0.8em;
  border-radius: 10px;
  background: color-mix(in srgb, ${theme.colors.goldSoft} 70%, transparent);
  border-inline-start: 3px solid color-mix(in srgb, ${theme.colors.gold} 55%, transparent);
  small, big, b { font: inherit; color: inherit; }
`;

const Heading = styled.p`
  ${anchor}
  font-family: ${theme.fonts.body};
  font-size: calc(1.08rem * var(--siddur-scale, 1.22));
  font-weight: 700;
  color: ${theme.colors.primary};
  margin: 1.1em 0 0.4em;
  big { font-size: 1em; }
`;

const isInstruction = (html: string) => /^<small>[\s\S]*<\/small>$/.test(html) && !/<\/small>[\s\S]*<small>/.test(html);
const isHeading = (html: string) => html.startsWith('<big>') && html.replace(/<[^>]+>/g, '').length < 40;

/** Renders SANITIZED Sefaria segments (see lib/siddur/sanitize). */
function ReadingText({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((html, i) => {
        if (!html) return null;
        const Comp = isInstruction(html) ? Instruction : isHeading(html) ? Heading : Para;
        return <Comp key={i} data-para={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </>
  );
}

export default memo(ReadingText);
