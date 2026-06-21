'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

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
  width: 68px; height: 68px;
  border-radius: 50%;
  background: ${theme.colors.secondary};
  border: 3px solid ${theme.colors.surface};
  box-shadow: ${theme.shadows.md};
  display: flex; align-items: center; justify-content: center;
  font-family: ${theme.fonts.body};
  font-weight: 700; font-size: 1rem; color: white;
`;

const CreatorName = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.45rem; font-weight: 700;
  color: ${theme.colors.primary}; text-align: center;
`;

const CreatorRole = styled.div`
  font-size: 0.88rem; color: ${theme.colors.textMuted};
  text-align: center; margin-top: -${theme.spacing.sm};
`;

const Links = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm}; width: 100%;`;

const Link = styled.a`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.borderLight};
  color: ${theme.colors.textMuted}; font-size: 0.9rem; direction: ltr;
  transition: all 0.15s;
  &:hover { background: ${theme.colors.surfaceAlt}; border-color: ${theme.colors.border}; color: ${theme.colors.primary}; }
`;

const EmailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="5" fill={theme.colors.surfaceAlt} />
    <path d="M5 8.5A2.5 2.5 0 017.5 6h9A2.5 2.5 0 0119 8.5v7a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 015 15.5v-7z" stroke={theme.colors.primaryLight} strokeWidth="1.4" />
    <path d="M5.5 8.5L12 13.5l6.5-5" stroke={theme.colors.primaryLight} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
    <rect width="24" height="24" rx="5" fill="#0077B5" />
    <path d="M6.5 9.5h-2v8h2v-8zm-1-3a1.1 1.1 0 110 2.2A1.1 1.1 0 015.5 6.5zM18.5 17.5h-2v-3.8c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.1.2-.1.5-.1.7v3.8h-2s.02-6.5 0-8h2v1.1c.3-.4.8-1.1 2-1.1 1.4 0 2.7 1 2.7 3.1v4.9z" fill="white" />
  </svg>
);

export default function CreatorSection() {
  return (
    <CreatorCard>
      <CreatorBanner>
        <BannerLabel>{HE.ABOUT_CREATOR_SECTION}</BannerLabel>
      </CreatorBanner>
      <CreatorBody>
        <Avatar>{HE.ABOUT_CREATOR_INITIALS}</Avatar>
        <CreatorName>{HE.ABOUT_CREATOR_NAME}</CreatorName>
        <CreatorRole>{HE.ABOUT_CREATOR_ROLE}</CreatorRole>
        <Links>
          <Link href={`mailto:${HE.ABOUT_CREATOR_EMAIL}`}>
            <EmailIcon /> {HE.ABOUT_CREATOR_EMAIL}
          </Link>
          <Link href="https://www.linkedin.com/in/orelkakon/" target="_blank" rel="noopener noreferrer">
            <LinkedInIcon /> LinkedIn · orelkakon
          </Link>
        </Links>
      </CreatorBody>
    </CreatorCard>
  );
}
