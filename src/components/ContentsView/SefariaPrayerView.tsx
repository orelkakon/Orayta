'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';

interface SefariaResp { he: string[]; }

const Card = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`;

const Para = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1.05rem;
  line-height: 2.1;
  color: ${theme.colors.text};
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }

  big {
    display: block;
    font-size: 1.15rem;
    font-weight: 700;
    color: ${theme.colors.primary};
    border-bottom: 2px solid ${theme.colors.borderLight};
    padding-bottom: 4px;
    margin-bottom: ${theme.spacing.xs};
  }

  small {
    display: block;
    font-size: 0.82rem;
    color: ${theme.colors.textMuted};
    line-height: 1.6;
  }

  b { color: ${theme.colors.primary}; }
`;

const Loading = styled.div`
  text-align: center; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl}; font-size: 0.95rem;
`;

const Error = styled.div`
  text-align: center; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xl}; font-size: 0.9rem;
`;

function toUrl(ref: string): string {
  return ref.replace(/, /g, '%2C_');
}

export default function SefariaPrayerView({ sefariaRef }: { sefariaRef: string }) {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`https://www.sefaria.org/api/texts/${toUrl(sefariaRef)}?lang=he`)
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
  if (error) return <Error>לא ניתן לטעון את הטקסט. נסה שוב מאוחר יותר.</Error>;

  return (
    <Card>
      {paragraphs.map((p, i) => (
        <Para key={i} dangerouslySetInnerHTML={{ __html: p }} />
      ))}
    </Card>
  );
}
