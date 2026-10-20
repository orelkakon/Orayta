'use client';

import { memo } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { LearnText } from '@/types/dailyLearning';
import { toHebrewNumeral } from '@/lib/hebrewNumerals';

// Sizes follow --siddur-scale, the reading scale shared with the siddur.
const Column = styled.article`max-width: 720px; margin: 0 auto; width: 100%;`;

const BlockHead = styled.h2`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: calc(1.05rem * var(--siddur-scale, 1.22)); font-weight: 800;
  color: ${theme.colors.primary}; margin: ${theme.spacing.lg} 0 ${theme.spacing.sm};
  &::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to left, ${theme.colors.secondary}66, transparent); }
`;

const Seg = styled.div`margin: 0 0 0.9em;`;

const Para = styled.p`
  font-family: ${theme.fonts.body};
  font-size: calc(1.05rem * var(--siddur-scale, 1.22));
  line-height: 2;
  color: ${theme.colors.text};
  margin: 0;
  text-wrap: pretty;
  big { font-size: 1.2em; font-weight: 700; }
  b, strong { color: ${theme.colors.primary}; font-weight: 700; }
  small { display: block; margin: 0.35em 0; font-size: 0.86em; line-height: 1.8; color: ${theme.colors.textMuted}; }
`;

const Num = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 1.7em; height: 1.7em; padding: 0 0.3em; margin-inline-end: 0.45em;
  border-radius: 999px; vertical-align: 0.15em;
  font-family: ${theme.fonts.ui}; font-size: 0.62em; font-weight: 700;
  color: ${theme.colors.secondary};
  background: color-mix(in srgb, ${theme.colors.secondary} 12%, transparent);
`;

const Explain = styled.p`
  margin: 0.45em 0 0; padding: 0.55em 0.9em;
  border-inline-start: 3px solid ${theme.colors.secondary};
  border-radius: 0 ${theme.radii.sm} ${theme.radii.sm} 0;
  background: ${theme.colors.surfaceAlt};
  font-family: ${theme.fonts.body}; font-size: calc(0.92rem * var(--siddur-scale, 1.22)); line-height: 1.9;
  color: ${theme.colors.textMuted};
  b, strong { color: ${theme.colors.text}; font-weight: 700; }
  small { font-size: 0.9em; }
`;

/** Today's portion: optional block headings (פרק / עמוד), numbered segments, Steinsaltz under each. */
function LearnTextView({ text }: { text: LearnText }) {
  return (
    <Column>
      {text.blocks.map((b, bi) => (
        <section key={bi} aria-label={b.heading ?? undefined}>
          {b.heading && <BlockHead>{b.heading}</BlockHead>}
          {b.segments.map(s => (
            <Seg key={s.n}>
              <Para>
                {text.numbered && <Num aria-hidden>{toHebrewNumeral(s.n)}</Num>}
                <span dangerouslySetInnerHTML={{ __html: s.html }} />
              </Para>
              {s.explain && <Explain dangerouslySetInnerHTML={{ __html: s.explain }} />}
            </Seg>
          ))}
        </section>
      ))}
    </Column>
  );
}

export default memo(LearnTextView);
