'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import OraytaLogo from '@/components/common/OraytaLogo';
import { HE } from '@/lib/hebrewTexts';
import ShareSection from './ShareSection';
import CreatorSection from './CreatorSection';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.xl}; padding: ${theme.spacing.xxl} 0;
  animation: ${fadeUp} 0.5s ease;
`;

const LogoBlock = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
`;

const LogoCircle = styled.div`
  width: 120px; height: 120px; border-radius: 50%;
  background: ${theme.colors.primary};
  display: flex; align-items: center; justify-content: center;
  box-shadow: ${theme.shadows.lg};
`;

const AppName = styled.h1`
  font-family: ${theme.fonts.body}; font-size: 2.4rem;
  color: ${theme.colors.primary}; text-align: center;
`;

const AppSubtitle = styled.p`
  font-size: 1rem; color: ${theme.colors.textMuted}; text-align: center;
`;

const Card = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  width: 100%; max-width: 560px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: 1rem; font-weight: 600; color: ${theme.colors.textMuted};
  border-bottom: 2px solid ${theme.colors.borderLight};
  padding-bottom: ${theme.spacing.sm};
`;

const FeatureList = styled.ul`
  list-style: none; display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const FeatureItem = styled.li`
  display: flex; align-items: flex-start; gap: ${theme.spacing.sm};
  font-size: 0.95rem; color: ${theme.colors.text}; line-height: 1.5;
`;

const FeatureIcon = styled.span`font-size: 1.1rem; flex-shrink: 0; margin-top: 1px;`;

const Verse = styled.blockquote`
  font-family: ${theme.fonts.body}; font-size: 1.05rem; line-height: 1.8;
  color: ${theme.colors.textMuted}; text-align: center;
  border-right: 3px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md}; font-style: italic;
`;

const CopyrightCard = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  width: 100%; max-width: 560px;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const CopyRow = styled.div`
  display: flex; align-items: flex-start; gap: ${theme.spacing.sm};
  font-size: 0.9rem; color: ${theme.colors.text}; line-height: 1.6;
`;

const CopyIcon = styled.span`font-size: 1.1rem; flex-shrink: 0; margin-top: 1px;`;

const Footer = styled.div`
  font-size: 0.78rem; color: ${theme.colors.textLight};
  text-align: center; padding-bottom: ${theme.spacing.md};
`;

export default function AboutView() {
  return (
    <Page>
      <LogoBlock>
        <LogoCircle><OraytaLogo size={80} /></LogoCircle>
        <AppName>{HE.APP_NAME}</AppName>
        <AppSubtitle>{HE.APP_SUBTITLE}</AppSubtitle>
      </LogoBlock>

      <Card>
        <SectionTitle>{HE.ABOUT_TITLE}</SectionTitle>
        <FeatureList>
          {HE.ABOUT_FEATURES.map((f, i) => (
            <FeatureItem key={i}>
              <FeatureIcon>{f.icon}</FeatureIcon>
              <span>{f.text}</span>
            </FeatureItem>
          ))}
        </FeatureList>
        <Verse>&ldquo;{HE.ABOUT_VERSE}&rdquo;</Verse>
      </Card>

      <CreatorSection />

      <ShareSection />

      <CopyrightCard>
        <SectionTitle>{HE.ABOUT_COPYRIGHT_TITLE}</SectionTitle>
        <CopyRow>
          <CopyIcon>©</CopyIcon>
          <span>{HE.ABOUT_COPYRIGHT_TEXT}</span>
        </CopyRow>
        <CopyRow>
          <CopyIcon>🌿</CopyIcon>
          <span>{HE.ABOUT_SHARING_TEXT}</span>
        </CopyRow>
      </CopyrightCard>

      <Footer>{HE.ABOUT_FOOTER}</Footer>
    </Page>
  );
}
