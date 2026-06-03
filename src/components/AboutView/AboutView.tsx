'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import OraytaLogo from '@/components/common/OraytaLogo';

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

const CreatorRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const CreatorName = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.4rem;
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const CreatorEmail = styled.a`
  font-size: 0.9rem;
  color: ${theme.colors.primaryLight};
  direction: ltr;
  display: inline-block;
  &:hover { text-decoration: underline; }
`;

const SocialRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.xs};
`;

const LinkedInLink = styled.a`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: 0.85rem;
  color: #0077B5;
  direction: ltr;
  font-weight: 500;
  transition: opacity 0.15s;
  &:hover { opacity: 0.75; }
`;

const Footer = styled.div`
  font-size: 0.78rem;
  color: ${theme.colors.textLight};
  text-align: center;
  padding-bottom: ${theme.spacing.md};
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

const FEATURES = [
  { icon: '📖', text: 'הוספה מהירה של ציטוטים מהתלמוד הבבלי עם ציון מסכת, דף ועמוד' },
  { icon: '🔍', text: 'צפייה בכל הציטוטים עם פילטור לפי סדר, מסכת וחיפוש חופשי' },
  { icon: '✏️', text: 'עריכה ומחיקה קלה של ציטוטים קיימים' },
  { icon: '🧠', text: 'מצב חידון אינטראקטיבי — זהה את מקור הציטוט ועקוב אחרי ההתקדמות' },
  { icon: '📱', text: 'ממשק מותאם למובייל ולמחשב, נגיש מכל מקום' },
];

export default function AboutView() {
  return (
    <Page>
      <LogoBlock>
        <LogoCircle>
          <OraytaLogo size={80} />
        </LogoCircle>
        <AppName>אורייתא</AppName>
        <AppSubtitle>מערכת לניהול ולימוד ציטוטים מהתלמוד הבבלי</AppSubtitle>
      </LogoBlock>

      <Card>
        <SectionTitle>אודות המערכת</SectionTitle>
        <FeatureList>
          {FEATURES.map((f, i) => (
            <FeatureItem key={i}>
              <FeatureIcon>{f.icon}</FeatureIcon>
              <span>{f.text}</span>
            </FeatureItem>
          ))}
        </FeatureList>
        <Verse>
          &ldquo;לקח טוב נתתי לכם, תורתי אל תעזובו&rdquo;
        </Verse>
      </Card>

      <Card>
        <SectionTitle>יוצר</SectionTitle>
        <CreatorRow>
          <CreatorName>אוראל קקון</CreatorName>
          <CreatorEmail href="mailto:orelkakonweb@gmail.com">
            orelkakonweb@gmail.com
          </CreatorEmail>
          <SocialRow>
            <LinkedInLink
              href="https://www.linkedin.com/in/orelkakon/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077B5">
                <rect width="24" height="24" rx="4" fill="#0077B5"/>
                <path d="M6.5 9.5h-2v8h2v-8zm-1-3a1.1 1.1 0 110 2.2A1.1 1.1 0 015.5 6.5zM18.5 17.5h-2v-3.8c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.1.2-.1.5-.1.7v3.8h-2s.02-6.5 0-8h2v1.1c.3-.4.8-1.1 2-1.1 1.4 0 2.7 1 2.7 3.1v4.9z" fill="white"/>
              </svg>
              LinkedIn
            </LinkedInLink>
          </SocialRow>
        </CreatorRow>
      </Card>

      <Footer>© 2026 אוראל קקון · אורייתא</Footer>
    </Page>
  );
}
