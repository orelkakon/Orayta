'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import AboutHero from './AboutHero';
import AboutManifesto from './AboutManifesto';
import AboutChain from './AboutChain';
import AboutFeatures from './AboutFeatures';
import ContentStatsCard from './ContentStatsCard';
import CreatorSection from './CreatorSection';
import ShareSection from './ShareSection';

const Page = styled.div`
  width: 100%; max-width: 1000px; margin: 0 auto;
  display: flex; flex-direction: column; gap: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
`;

const Footer = styled.footer`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.xs};
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textLight}; text-align: center; line-height: 1.6;
`;

/**
 * /about — told as a story while scrolling: the stage (letters orbiting the
 * logo), the why (lit word by word), the chain of generations, what's
 * inside, the numbers, who builds it, and sharing.
 */
export default function AboutView() {
  return (
    <Page>
      <AboutHero />
      <AboutManifesto />
      <AboutChain />
      <AboutFeatures />
      <ContentStatsCard />
      <CreatorSection />
      <ShareSection />
      <Footer>
        <span>{HE.ABOUT_COPYRIGHT_TEXT}</span>
        <span>{HE.ABOUT_SHARING_TEXT}</span>
        <span>{HE.ABOUT_DIVINE_TEXT}</span>
      </Footer>
    </Page>
  );
}
