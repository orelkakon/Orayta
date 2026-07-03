'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import DedicationsBar from './DedicationsBar';
import FeedBannerBlock from './FeedBannerBlock';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
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
  font-size: 2.2rem; font-weight: 700; color: ${theme.colors.primary};
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
  gap: ${theme.spacing.md};
  width: 100%;
  @media (max-width: 480px) { gap: ${theme.spacing.sm}; }
`;

const SectionCard = styled(Link)`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg};
  padding: 10px ${theme.spacing.md};
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.xs}; text-align: center;
  box-shadow: ${theme.shadows.sm};
  transition: box-shadow 0.18s, transform 0.18s, border-top-color 0.18s;
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-3px);
    border-top-color: ${theme.colors.primary};
  }
`;

const CardIcon = styled.span`font-size: 1.7rem; line-height: 1;`;
const CardLabel = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.92rem; font-weight: 700; color: ${theme.colors.primary};
`;
const CardDesc = styled.span`
  font-size: 0.7rem; color: ${theme.colors.textMuted}; line-height: 1.4;
`;

const ContactBanner = styled(Link)`
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  gap: ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #8B5E3C 100%);
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  color: white; cursor: pointer;
  box-shadow: 0 6px 24px rgba(92, 61, 30, 0.35);
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(92, 61, 30, 0.45); }
`;

const ContactLeft = styled.div`display: flex; align-items: center; gap: ${theme.spacing.md};`;
const ContactEmoji = styled.div`font-size: 2.6rem; line-height: 1; flex-shrink: 0;`;
const ContactBody = styled.div`display: flex; flex-direction: column; gap: 3px;`;
const ContactTitle = styled.div`
  font-family: ${theme.fonts.body}; font-size: 1.25rem; font-weight: 800;
`;
const ContactSub = styled.div`font-size: 0.88rem; opacity: 0.8;`;
const ContactArrow = styled.div`font-size: 1.8rem; opacity: 0.7; flex-shrink: 0;`;

export default function HomeView() {
  return (
    <Page>
      <Hero>
        <AppTitle>{HE.APP_NAME}</AppTitle>
        <QuoteBlock>
          <QuoteText>{HE.HOME_QUOTE}</QuoteText>
          <QuoteSource>{HE.HOME_QUOTE_SOURCE}</QuoteSource>
        </QuoteBlock>
      </Hero>

      <DedicationsBar part="ticker" />

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

      <FeedBannerBlock />

      <ContactBanner href="/contact">
        <ContactLeft>
          <ContactEmoji>📞</ContactEmoji>
          <ContactBody>
            <ContactTitle>יש לך שאלה, הערה או רעיון?</ContactTitle>
            <ContactSub>צור קשר — נשמח לשמוע ממך</ContactSub>
          </ContactBody>
        </ContactLeft>
        <ContactArrow>←</ContactArrow>
      </ContactBanner>

      {/* Admin-only: add/manage dedications — at the bottom of the page */}
      <DedicationsBar part="admin" />
    </Page>
  );
}
