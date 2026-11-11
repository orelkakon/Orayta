'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { requestInstall } from '@/lib/install';
import { CardButton, CardLink } from '@/components/ui/Card';
import { LineIcon } from '@/components/common/LineIcons';
import { useInstallMode } from '@/components/common/useInstallMode';

/**
 * Under the thanks: the two next steps for someone who just read a chapter in
 * another person's reading — open one of their own, and keep Orayta on the
 * home screen (the system install dialog on Android / desktop Chrome, the
 * steps on iPhone; hidden when already installed or unsupported).
 */
const Wrap = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm}; width: 100%; max-width: 340px;
  margin-top: ${theme.spacing.sm}; padding-top: ${theme.spacing.md}; border-top: 1px solid ${theme.colors.borderLight};
`;
const Row = styled.span`display: flex; align-items: center; gap: ${theme.spacing.ms};`;
const Icon = styled.span`
  flex-shrink: 0; width: 40px; height: 40px; border-radius: ${theme.radii.md};
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.goldSoft}; color: ${theme.colors.gold};
`;
const Body = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;
const Title = styled.span`font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.text};`;
const Sub = styled.span`font-size: ${theme.fontSizes.sm}; line-height: 1.4; color: ${theme.colors.textMuted};`;
const Chevron = styled.span`display: flex; color: ${theme.colors.textLight};`;

function Offer({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <Row>
      <Icon><LineIcon name={icon} size={20} /></Icon>
      <Body><Title>{title}</Title><Sub>{sub}</Sub></Body>
      <Chevron><LineIcon name="chevron" size={18} /></Chevron>
    </Row>
  );
}

export default function GrowthOffers() {
  const mode = useInstallMode();
  return (
    <Wrap>
      <CardLink href="/tehillim/new" $pad="sm" $interactive>
        <Offer icon="plus" title={HE.TH_GROW_OWN} sub={HE.TH_GROW_OWN_SUB} />
      </CardLink>
      {mode && (
        <CardButton $pad="sm" $interactive onClick={requestInstall}>
          <Offer icon="home" title={HE.TH_GROW_INSTALL} sub={mode === 'ios' ? HE.TH_GROW_INSTALL_IOS : HE.TH_GROW_INSTALL_SUB} />
        </CardButton>
      )}
    </Wrap>
  );
}
