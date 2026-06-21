'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';
import DedicationsBar from './DedicationsBar';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.xl} 0 ${theme.spacing.xxl};
  animation: ${fadeUp} 0.45s ease;
`;

/* ── Hero ── */
const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  text-align: center;
`;

const LogoRing = styled.div`
  width: 100px; height: 100px; border-radius: 50%;
  background: ${theme.colors.primary};
  display: flex; align-items: center; justify-content: center;
  box-shadow: ${theme.shadows.lg};
  border: 3px solid ${theme.colors.secondary}44;
`;

const AppTitle = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: 2.6rem; font-weight: 700;
  color: ${theme.colors.primary};
`;

const QuoteBlock = styled.blockquote`
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  border-right: 3px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md};
`;

const QuoteText = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1.1rem; color: ${theme.colors.textMuted};
  font-style: italic; line-height: 1.6;
`;

const QuoteSource = styled.span`
  font-size: 0.78rem; color: ${theme.colors.textLight};
  direction: rtl; letter-spacing: 0.03em;
`;

const WelcomeText = styled.p`
  font-size: 1rem; color: ${theme.colors.textMuted};
  text-align: center; max-width: 420px; line-height: 1.6;
`;

/* ── Divider ── */
const Divider = styled.div`
  width: 120px; height: 1px;
  background: linear-gradient(90deg, transparent, ${theme.colors.secondary}, transparent);
`;

/* ── Section cards grid ── */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  width: 100%;
  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 360px) { grid-template-columns: 1fr; }
`;

const SectionCard = styled(Link)`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  text-align: center;
  box-shadow: ${theme.shadows.sm};
  transition: box-shadow 0.18s, transform 0.18s, border-top-color 0.18s;
  cursor: pointer;
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-3px);
    border-top-color: ${theme.colors.primary};
  }
`;

const CardIcon = styled.span`font-size: 2rem; line-height: 1;`;
const CardLabel = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1rem; font-weight: 700; color: ${theme.colors.primary};
`;
const CardDesc = styled.span`
  font-size: 0.74rem; color: ${theme.colors.textMuted};
  line-height: 1.4;
`;

export default function HomeView() {
  return (
    <Page>
      <Hero>
        <LogoRing>
          <OraytaLogo size={68} />
        </LogoRing>
        <AppTitle>{HE.APP_NAME}</AppTitle>
        <QuoteBlock>
          <QuoteText>{HE.HOME_QUOTE}</QuoteText>
          <QuoteSource>{HE.HOME_QUOTE_SOURCE}</QuoteSource>
        </QuoteBlock>
        <WelcomeText>{HE.APP_SUBTITLE}</WelcomeText>
      </Hero>

      <DedicationsBar />

      <Divider />

      <Grid>
        {HE.HOME_SECTIONS.map(s => (
          <SectionCard key={s.href} href={s.href}>
            <CardIcon>{s.icon}</CardIcon>
            <CardLabel>{s.label}</CardLabel>
            <CardDesc>{s.desc}</CardDesc>
          </SectionCard>
        ))}
      </Grid>
    </Page>
  );
}
