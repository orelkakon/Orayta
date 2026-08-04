'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';
import FeedBannerBlock from './FeedBannerBlock';
import LiveBannerBlock from './LiveBannerBlock';
import SectionIcon from './HomeIcons';
import HomeActionCards from './HomeActionCards';
import HomeBackground from './HomeBackground';
import StoriesRow from './StoriesRow';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
`;

/* The tiles run their own staggered fadeUp, so the page container stays
   static — animating both would double the motion on the tiles. */
const Page = styled.div`
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.ms};
  padding: ${theme.spacing.sm} 0 ${theme.spacing.xl};
`;

const Hero = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.xs}; text-align: center;
  animation: ${fadeUp} 0.45s ease both;
`;

/* Gold-ringed logo medallion — gives the text-only hero a visual anchor. */
const LogoMedallion = styled.div`
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 32% 28%, rgba(196,149,106,0.3), rgba(196,149,106,0.06));
  border: 1.5px solid rgba(196,149,106,0.55);
  box-shadow: 0 3px 14px rgba(92,61,30,0.18), inset 0 1px 0 rgba(255,255,255,0.35);
`;

const AppTitle = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: 1.55rem; font-weight: 700; color: ${theme.colors.primary};
`;

/* One-line slogan: the font scales down with the viewport instead of wrapping. */
const Tagline = styled.p`
  font-size: clamp(0.68rem, 2.7vw, ${theme.fontSizes.sm});
  color: ${theme.colors.textMuted};
  line-height: 1.5;
  white-space: nowrap;
  margin: 0 auto;
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
  /* Three columns on a 360px phone leaves ~104px per tile, which wraps the
     Hebrew labels to three lines. Two columns keeps them readable. */
  @media (max-width: 520px) { grid-template-columns: repeat(2, 1fr); }
`;

const SectionCard = styled(Link)<{ $index: number }>`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  display: flex; flex-direction: column; align-items: center;
  gap: 5px; text-align: center;
  box-shadow: ${theme.shadows.sm};
  transition: box-shadow 0.18s, transform ${theme.motion.fast} ease, border-top-color 0.18s;
  animation: ${fadeUp} 0.45s ease both;
  animation-delay: ${({ $index }) => $index * 50}ms;
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-3px);
    border-top-color: ${theme.colors.primary};
  }
  &:active { transform: scale(0.97); }
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
  font-size: 1.15rem; font-weight: 800; color: ${theme.colors.primary};
  line-height: 1.25;
  @media (max-width: 480px) { font-size: 1.02rem; }
`;
/* Kept visible at every width: the description is the only thing that
   distinguishes the similarly-named sections at a glance. */
const CardDesc = styled.span`
  font-size: 0.75rem; color: ${theme.colors.textMuted}; line-height: 1.4;
  @media (max-width: 400px) { font-size: 0.68rem; }
`;

export default function HomeView() {
  return (
    <>
      <HomeBackground />
      <Page>
      <StoriesRow />

      <Hero>
        <LogoMedallion><OraytaLogo size={32} /></LogoMedallion>
        <AppTitle>{HE.APP_NAME}</AppTitle>
        <Tagline>{HE.HOME_TAGLINE}</Tagline>
      </Hero>

      <LiveBannerBlock />

      <FeedBannerBlock />

      <Divider />

      <Grid>
        {HE.HOME_SECTIONS.map((s, i) => (
          <SectionCard key={s.href} href={s.href} $index={i}>
            <CardIcon><SectionIcon href={s.href} size={23} /></CardIcon>
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
