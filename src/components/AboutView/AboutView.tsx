'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import OraytaLogo from '@/components/common/OraytaLogo';
import { HE } from '@/lib/hebrewTexts';
import ShareSection from './ShareSection';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.xxl} 0;
  animation: ${fadeUp} 0.5s ease;
`;

const LogoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const LogoCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.lg};
`;

const AppName = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: 2.4rem;
  color: ${theme.colors.primary};
  text-align: center;
`;

const AppSubtitle = styled.p`
  font-size: 1rem;
  color: ${theme.colors.textMuted};
  text-align: center;
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  border-bottom: 2px solid ${theme.colors.borderLight};
  padding-bottom: ${theme.spacing.sm};
`;

const FeatureList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  font-size: 0.95rem;
  color: ${theme.colors.text};
  line-height: 1.5;
`;

const FeatureIcon = styled.span`
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 1px;
`;

const Verse = styled.blockquote`
  font-family: ${theme.fonts.body};
  font-size: 1.05rem;
  line-height: 1.8;
  color: ${theme.colors.textMuted};
  text-align: center;
  border-right: 3px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md};
  font-style: italic;
`;

const CreatorCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.borderLight};
  width: 100%;
  max-width: 560px;
  overflow: hidden;
`;

const CreatorBanner = styled.div`
  height: 72px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 60%, ${theme.colors.secondary} 100%);
  display: flex;
  align-items: flex-end;
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
`;

const BannerLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.04em;
`;

const CreatorBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.xl} ${theme.spacing.xl};
`;

const Avatar = styled.div`
  margin-top: -32px;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: ${theme.colors.secondary};
  border: 3px solid ${theme.colors.surface};
  box-shadow: ${theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.body};
  font-weight: 700;
  font-size: 1rem;
  color: white;
`;

const CreatorName = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.45rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  text-align: center;
`;

const CreatorRole = styled.div`
  font-size: 0.88rem;
  color: ${theme.colors.textMuted};
  text-align: center;
  margin-top: -${theme.spacing.sm};
`;

const ContactLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

const ContactLink = styled.a`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.borderLight};
  color: ${theme.colors.textMuted};
  font-size: 0.9rem;
  direction: ltr;
  transition: all 0.15s;
  &:hover {
    background: ${theme.colors.surfaceAlt};
    border-color: ${theme.colors.border};
    color: ${theme.colors.primary};
  }
`;

const Footer = styled.div`
  font-size: 0.78rem;
  color: ${theme.colors.textLight};
  text-align: center;
  padding-bottom: ${theme.spacing.md};
`;

const EmailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="5" fill={theme.colors.surfaceAlt} />
    <path d="M5 8.5A2.5 2.5 0 017.5 6h9A2.5 2.5 0 0119 8.5v7a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 015 15.5v-7z"
      stroke={theme.colors.primaryLight} strokeWidth="1.4" />
    <path d="M5.5 8.5L12 13.5l6.5-5" stroke={theme.colors.primaryLight} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
    <rect width="24" height="24" rx="5" fill="#0077B5" />
    <path d="M6.5 9.5h-2v8h2v-8zm-1-3a1.1 1.1 0 110 2.2A1.1 1.1 0 015.5 6.5zM18.5 17.5h-2v-3.8c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.1.2-.1.5-.1.7v3.8h-2s.02-6.5 0-8h2v1.1c.3-.4.8-1.1 2-1.1 1.4 0 2.7 1 2.7 3.1v4.9z"
      fill="white" />
  </svg>
);

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

      <CreatorCard>
        <CreatorBanner>
          <BannerLabel>{HE.ABOUT_CREATOR_SECTION}</BannerLabel>
        </CreatorBanner>
        <CreatorBody>
          <Avatar>{HE.ABOUT_CREATOR_INITIALS}</Avatar>
          <CreatorName>{HE.ABOUT_CREATOR_NAME}</CreatorName>
          <CreatorRole>{HE.ABOUT_CREATOR_ROLE}</CreatorRole>
          <ContactLinks>
            <ContactLink href={`mailto:${HE.ABOUT_CREATOR_EMAIL}`}>
              <EmailIcon />
              {HE.ABOUT_CREATOR_EMAIL}
            </ContactLink>
            <ContactLink
              href="https://www.linkedin.com/in/orelkakon/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon />
              LinkedIn · orelkakon
            </ContactLink>
          </ContactLinks>
        </CreatorBody>
      </CreatorCard>

      <ShareSection />

      <Footer>{HE.ABOUT_FOOTER}</Footer>
    </Page>
  );
}
