'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { clip } from '@/lib/siteUrl';
import { LineIcon } from '@/components/common/LineIcons';
import type { HilulaRabbi } from '@/types/push';

const Card = styled.article`
  display: flex; gap: ${theme.spacing.md}; align-items: flex-start;
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.md}; box-shadow: ${theme.shadows.sm};
`;
const Portrait = styled.div`
  width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center; color: ${theme.colors.secondary};
  background: radial-gradient(circle at 32% 28%, rgba(196,149,106,0.3), rgba(196,149,106,0.08));
  border: 1.5px solid rgba(196,149,106,0.55);
  img { width: 100%; height: 100%; object-fit: cover; }
`;
const Body = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;`;
const Name = styled.h3`margin: 0; font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 800; color: ${theme.colors.primary};`;
const Meta = styled.div`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;
const Bio = styled.p`margin: 2px 0 0; font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.text};`;
const More = styled(Link)`align-self: flex-start; font-size: ${theme.fontSizes.xs}; font-weight: 700; color: ${theme.colors.primaryLight};`;

export default function TzadikCard({ rabbi }: { rabbi: HilulaRabbi }) {
  return (
    <Card>
      <Portrait>
        {rabbi.imageUrl
          ? <img src={rabbi.imageUrl} alt={rabbi.name} loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          : <LineIcon name="candle" size={26} />}
      </Portrait>
      <Body>
        <Name>{rabbi.name}</Name>
        <Meta>{[rabbi.fullName !== rabbi.name ? rabbi.fullName : null, rabbi.datePeriod].filter(Boolean).join(' · ')}</Meta>
        {rabbi.bio && <Bio>{clip(rabbi.bio, 180)}</Bio>}
        <More href={`/rabbis?q=${encodeURIComponent(rabbi.name)}`}>{HE.HILULA_BIO_MORE} ←</More>
      </Body>
    </Card>
  );
}
