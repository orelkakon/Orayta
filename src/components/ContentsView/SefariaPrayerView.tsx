'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { SiddurJump } from '@/lib/prayers/types';

interface SefariaResp { he: string[]; }

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;

const JumpRow = styled.div`display: flex; justify-content: flex-start;`;

const JumpBtn = styled.button`
  padding: 6px 14px; border-radius: ${theme.radii.sm};
  border: 1.5px solid ${theme.colors.secondary};
  font-size: 0.82rem; font-weight: 600; color: ${theme.colors.secondary};
  transition: all 0.15s;
  &:hover { background: ${theme.colors.secondary}14; }
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`;

const HeadingPara = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1.15rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  padding: ${theme.spacing.sm} 0 4px;
  border-bottom: 2px solid ${theme.colors.borderLight};
  margin-bottom: ${theme.spacing.xs};
  big { font-size: 1em; }
  b   { font-weight: 800; }
`;

const Para = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1.05rem;
  line-height: 2.1;
  color: ${theme.colors.text};
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }

  big  { font-size: 1.35em; font-weight: 700; }
  small {
    display: block;
    font-size: 0.8rem;
    color: ${theme.colors.textMuted};
    line-height: 1.5;
  }
  b { color: ${theme.colors.primary}; }
`;

const Loading = styled.div`
  text-align: center; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl}; font-size: 0.95rem;
`;

const ErrorMsg = styled.div`
  text-align: center; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xl}; font-size: 0.9rem;
`;

function toUrl(ref: string): string {
  return ref.replace(/, /g, '%2C_');
}

// Strip HTML tags + nikud/cantillation marks so jump matching works on plain letters
function toPlainLetters(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/[֑-ׇ]/g, '');
}

interface Props { sefariaRef: string; jump?: SiddurJump; }

export default function SefariaPrayerView({ sefariaRef, jump }: Props) {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    // context=0: for segment-range refs (e.g. The_Shema.2-9) return only the
    // requested range instead of the whole surrounding node
    fetch(`https://www.sefaria.org/api/texts/${toUrl(sefariaRef)}?lang=he&context=0`)
      .then(r => r.json())
      .then((d: SefariaResp) => {
        const items = d.he ?? [];
        setParagraphs(items);
        if (items.length === 0) setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sefariaRef]);

  if (loading) return <Loading>טוען...</Loading>;
  if (error) return <ErrorMsg>לא ניתן לטעון את הטקסט. נסה שוב מאוחר יותר.</ErrorMsg>;

  const jumpIdx = jump ? paragraphs.findIndex(p => toPlainLetters(p).includes(jump.match)) : -1;

  return (
    <Wrap>
      {jump && jumpIdx >= 0 && (
        <JumpRow>
          <JumpBtn onClick={() => paraRefs.current[jumpIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            {jump.label} ⬇
          </JumpBtn>
        </JumpRow>
      )}
      <Card>
        {paragraphs.map((p, i) => {
          const isHeading = p.trim().startsWith('<big>');
          const Comp = isHeading ? HeadingPara : Para;
          return (
            <Comp
              key={i}
              ref={(el: HTMLParagraphElement | null) => { paraRefs.current[i] = el; }}
              dangerouslySetInnerHTML={{ __html: p }}
            />
          );
        })}
      </Card>
    </Wrap>
  );
}
