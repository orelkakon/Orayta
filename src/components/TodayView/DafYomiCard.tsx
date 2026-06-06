'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

interface CalItem { title: { en: string; he: string }; displayValue: { en: string; he: string }; url: string; }
interface SefariaResp { calendar_items: CalItem[]; parasha?: { en: string; he: string }; }

const LABELS: { match: string; label: string }[] = [
  { match: 'Daf Yomi',     label: HE.TODAY_DAF_BAVLI },
  { match: 'Yerushalmi',   label: HE.TODAY_DAF_YERUSHALMI },
  { match: 'Jerusalem',    label: HE.TODAY_DAF_YERUSHALMI },
  { match: 'Rambam',       label: HE.TODAY_DAF_RAMBAM },
];

function getLabel(en: string): string | null {
  for (const { match, label } of LABELS) {
    if (en.includes(match)) return label;
  }
  return null;
}

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
`;
const CardHeader = styled.div`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-weight: 700;
  font-size: 1rem;
  font-family: ${theme.fonts.body};
`;
const Body = styled.div`display: flex; flex-direction: column;`;
const Item = styled.a`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.borderLight};
  text-decoration: none;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;
const ItemType = styled.span`font-size: 0.75rem; color: ${theme.colors.textMuted}; font-weight: 600;`;
const ItemValue = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.15rem;
  font-weight: 700;
  color: ${theme.colors.primary};
`;
const ItemEn = styled.span`font-size: 0.82rem; color: ${theme.colors.textLight};`;
const ParashaRow = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.borderLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ParashaLabel = styled.span`font-size: 0.85rem; color: ${theme.colors.textMuted};`;
const ParashaVal = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1rem;
  font-weight: 700;
  color: ${theme.colors.secondary};
`;
const Placeholder = styled.div`
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textMuted};
  font-size: 0.9rem;
  text-align: center;
`;

export default function DafYomiCard() {
  const [items, setItems] = useState<{ label: string; he: string; en: string; url: string }[]>([]);
  const [parasha, setParasha] = useState<{ en: string; he: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('https://www.sefaria.org/api/calendars?diaspora=0')
      .then(r => r.json())
      .then((d: SefariaResp) => {
        const seen = new Set<string>();
        const filtered = (d.calendar_items ?? []).flatMap(ci => {
          const label = getLabel(ci.title.en);
          if (!label || seen.has(label)) return [];
          seen.add(label);
          return [{ label, he: ci.displayValue.he, en: ci.displayValue.en, url: `https://www.sefaria.org/${ci.url}` }];
        });
        setItems(filtered);
        if (d.parasha) setParasha(d.parasha);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <Card>
      <CardHeader>{HE.TODAY_DAF_TITLE}</CardHeader>
      <Body>
        {loading && <Placeholder>{HE.LOADING}</Placeholder>}
        {error && <Placeholder>{HE.TODAY_ERROR}</Placeholder>}
        {!loading && !error && items.map(it => (
          <Item key={it.label} href={it.url} target="_blank" rel="noopener noreferrer">
            <ItemType>{it.label}</ItemType>
            <ItemValue>{it.he}</ItemValue>
            <ItemEn>{it.en}</ItemEn>
          </Item>
        ))}
        {!loading && !error && parasha && (
          <ParashaRow>
            <ParashaLabel>{HE.TODAY_PARASHA}</ParashaLabel>
            <ParashaVal>{parasha.he}</ParashaVal>
          </ParashaRow>
        )}
      </Body>
    </Card>
  );
}
