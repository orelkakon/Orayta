'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

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

const LogoText = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 2.8rem;
  color: white;
  line-height: 1;
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

  &:hover {
    text-decoration: underline;
  }
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
          <LogoText>א</LogoText>
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
        </CreatorRow>
      </Card>
    </Page>
  );
}
