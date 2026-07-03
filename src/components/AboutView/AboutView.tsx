'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import OraytaLogo from '@/components/common/OraytaLogo';
import { HE } from '@/lib/hebrewTexts';
import ShareSection from './ShareSection';
import CreatorSection from './CreatorSection';
import VisitsCounter from './VisitsCounter';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.xl}; padding: ${theme.spacing.xxl} 0;
  animation: ${fadeUp} 0.45s ease;
`;

const Hero = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm};
  text-align: center;
`;

const LogoCircle = styled.div`
  width: 108px; height: 108px; border-radius: 50%;
  background: ${theme.colors.primary};
  display: flex; align-items: center; justify-content: center;
  box-shadow: ${theme.shadows.lg}; margin-bottom: ${theme.spacing.xs};
`;

const AppName = styled.h1`
  font-family: ${theme.fonts.body}; font-size: 2.2rem;
  color: ${theme.colors.primary};
`;

const AppSubtitle = styled.p`
  font-size: 0.9rem; color: ${theme.colors.textMuted};
  max-width: 380px; line-height: 1.6;
`;

const Verse = styled.blockquote`
  font-family: ${theme.fonts.body}; font-size: 1rem; line-height: 1.7;
  color: ${theme.colors.textMuted}; text-align: center;
  border-right: 3px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md}; font-style: italic;
  max-width: 380px;
`;

const Card = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.lg} ${theme.spacing.xl}; box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  width: 100%; max-width: 580px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: 0.88rem; font-weight: 700; color: ${theme.colors.textMuted};
  letter-spacing: 0.06em; text-transform: uppercase;
  border-bottom: 2px solid ${theme.colors.borderLight};
  padding-bottom: ${theme.spacing.sm};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const FeatureCell = styled.div`
  display: flex; align-items: flex-start; gap: ${theme.spacing.sm};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
`;

const FeatureIcon = styled.span`font-size: 1.3rem; flex-shrink: 0; margin-top: 1px;`;

const FeatureBody = styled.div`display: flex; flex-direction: column; gap: 2px;`;

const FeatureTitle = styled.span`
  font-size: 0.88rem; font-weight: 700; color: ${theme.colors.text};
`;

const FeatureDesc = styled.span`
  font-size: 0.78rem; color: ${theme.colors.textMuted}; line-height: 1.45;
`;

const FooterRow = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.xs};
  font-size: 0.78rem; color: ${theme.colors.textLight}; text-align: center;
  padding-bottom: ${theme.spacing.md};
`;

export default function AboutView() {
  return (
    <Page>
      <Hero>
        <LogoCircle><OraytaLogo size={72} /></LogoCircle>
        <AppName>{HE.APP_NAME}</AppName>
        <AppSubtitle>{HE.APP_SUBTITLE}</AppSubtitle>
        <Verse>&ldquo;{HE.ABOUT_VERSE}&rdquo;</Verse>
      </Hero>

      <Card>
        <SectionTitle>{HE.ABOUT_TITLE}</SectionTitle>
        <FeaturesGrid>
          {HE.ABOUT_FEATURES.map((f, i) => (
            <FeatureCell key={i}>
              <FeatureIcon>{f.icon}</FeatureIcon>
              <FeatureBody>
                <FeatureTitle>{f.title}</FeatureTitle>
                <FeatureDesc>{f.text}</FeatureDesc>
              </FeatureBody>
            </FeatureCell>
          ))}
        </FeaturesGrid>
      </Card>

      <VisitsCounter />
      <CreatorSection />
      <ShareSection />

      <FooterRow>
        <span>{HE.ABOUT_COPYRIGHT_TEXT}</span>
        <span>{HE.ABOUT_SHARING_TEXT}</span>
        <span>🙏 {HE.ABOUT_DIVINE_TEXT}</span>
      </FooterRow>
    </Page>
  );
}
