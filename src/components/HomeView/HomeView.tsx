'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import FeedBannerBlock from './FeedBannerBlock';
import SectionIcon from './HomeIcons';
import HomeActionCards from './HomeActionCards';
import HomeBackground from './HomeBackground';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0 ${theme.spacing.xl};
  animation: ${fadeUp} 0.45s ease;
`;

const Hero = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.sm}; text-align: center;
`;

const AppTitle = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: 1.9rem; font-weight: 700; color: ${theme.colors.primary};
`;

const QuoteBlock = styled.blockquote`
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  border-right: 3px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md};
`;

const QuoteText = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 0.95rem; color: ${theme.colors.textMuted};
  font-style: italic; line-height: 1.6;
`;

const QuoteSource = styled.span`
  font-size: 0.76rem; color: ${theme.colors.textLight}; letter-spacing: 0.03em;
`;

const Divider = styled.div`
  width: 140px; height: 2px;
  background: linear-gradient(90deg, transparent, ${theme.colors.secondary}, transparent);
  border-radius: 2px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  width: 100%;
`;

const SectionCard = styled(Link)`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.lg} ${theme.spacing.sm};
  display: flex; flex-direction: column; align-items: center;
  gap: 5px; text-align: center;
  box-shadow: ${theme.shadows.sm};
  transition: box-shadow 0.18s, transform 0.18s, border-top-color 0.18s;
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-3px);
    border-top-color: ${theme.colors.primary};
  }
  @media (max-width: 480px) { padding: ${theme.spacing.md} ${theme.spacing.xs}; }
`;

const CardIcon = styled.span`
  display: inline-flex; line-height: 1;
  color: ${theme.colors.secondary};
  filter: drop-shadow(0 1px 2px rgba(92,61,30,0.18));
  transition: color 0.18s, transform 0.18s;
  ${SectionCard}:hover & { color: ${theme.colors.primary}; transform: translateY(-2px); }
`;
const CardLabel = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.18rem; font-weight: 800; color: ${theme.colors.primary};
  line-height: 1.25;
  @media (max-width: 480px) { font-size: 1.02rem; }
`;
const CardDesc = styled.span`
  font-size: 0.75rem; color: ${theme.colors.textMuted}; line-height: 1.4;
  @media (max-width: 400px) { display: none; }
`;

export default function HomeView() {
  return (
    <>
      <HomeBackground />
      <Page>
      <Hero>
        <AppTitle>{HE.APP_NAME}</AppTitle>
        <QuoteBlock>
          <QuoteText>{HE.HOME_QUOTE}</QuoteText>
          <QuoteSource>{HE.HOME_QUOTE_SOURCE}</QuoteSource>
        </QuoteBlock>
      </Hero>

      <FeedBannerBlock />

      <Divider />

      <Grid>
        {HE.HOME_SECTIONS.map(s => (
          <SectionCard key={s.href} href={s.href}>
            <CardIcon><SectionIcon href={s.href} /></CardIcon>
            <CardLabel>{s.label}</CardLabel>
            <CardDesc>{s.desc}</CardDesc>
          </SectionCard>
        ))}
      </Grid>

      <HomeActionCards />
      </Page>
    </>
  );
}
