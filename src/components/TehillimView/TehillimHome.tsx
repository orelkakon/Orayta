'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LineIcon } from '@/components/common/LineIcons';
import MyCircles from './MyCircles';
import { Page, Night, Kicker, Dedication, NightText, Section, SectionTitle } from './styles';

/** /tehillim — what it is, the button to open one, this device's readings, and how it works. */
const Cta = styled.div`margin-top: ${theme.spacing.lg};`;
const Steps = styled.ol`
  margin: 0; padding: 0; list-style: none; display: grid; gap: ${theme.spacing.sm};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); counter-reset: step;
`;
const Step = styled(Card).attrs({ as: 'li' })`
  counter-increment: step; display: flex; flex-direction: column; gap: 4px;
  &::before {
    content: counter(step); width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
    font-weight: 800; font-size: ${theme.fontSizes.sm}; background: ${theme.gilded.fill}; color: ${theme.gilded.ink};
  }
  & > b { font-size: ${theme.fontSizes.md}; color: ${theme.colors.text}; }
  & > span { font-size: ${theme.fontSizes.sm}; line-height: 1.5; color: ${theme.colors.textMuted}; }
`;
const Perks = styled.ul`margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Perk = styled.li`
  display: flex; gap: ${theme.spacing.sm}; align-items: flex-start; font-size: ${theme.fontSizes.md}; line-height: 1.55; color: ${theme.colors.text};
  & > svg { flex: none; margin-top: 4px; color: ${theme.colors.gold}; }
`;

export default function TehillimHome() {
  return (
    <Page>
      <Night>
        <Kicker><LineIcon name="scroll" size={16} /> {HE.TH_HERO_KICKER}</Kicker>
        <Dedication>{HE.TH_HERO_TITLE}</Dedication>
        <NightText>{HE.TH_HERO_SUB}</NightText>
        <Cta><ButtonLink href="/tehillim/new" $variant="gold" $size="lg" $block><LineIcon name="plus" size={20} /> {HE.TH_HERO_CTA}</ButtonLink></Cta>
      </Night>
      <MyCircles />
      <Section aria-labelledby="th-steps">
        <SectionTitle id="th-steps">{HE.TH_STEPS_TITLE}</SectionTitle>
        <Steps>{HE.TH_STEPS.map(s => <Step key={s.title} $pad="md"><b>{s.title}</b><span>{s.text}</span></Step>)}</Steps>
      </Section>
      <Section aria-labelledby="th-perks">
        <SectionTitle id="th-perks">{HE.TH_PERKS_TITLE}</SectionTitle>
        <Card $pad="lg"><Perks>{HE.TH_PERKS.map(p => <Perk key={p}><LineIcon name="check" size={18} strokeWidth={2.4} /><span>{p}</span></Perk>)}</Perks></Card>
      </Section>
    </Page>
  );
}
