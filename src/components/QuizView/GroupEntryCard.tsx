'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';

const Card = styled(Link)`
  display: flex; align-items: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg}; border-radius: ${theme.radii.lg};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: ${theme.colors.onPrimary}; text-decoration: none; box-shadow: ${theme.shadows.md};
  transition: transform ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
  @media (hover: hover) { &:hover { transform: translateY(-2px); box-shadow: ${theme.shadows.lg}; } }
  &:active { transform: scale(0.98); }
  &:focus-visible { outline: 3px solid ${theme.colors.accentLight}; outline-offset: 2px; }
`;
const IconBox = styled.span`
  flex: none; width: 46px; height: 46px; border-radius: ${theme.radii.md}; display: grid; place-items: center;
  background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.22);
`;
const Text = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;
const Title = styled.span`font-size: 1.02rem; font-weight: 800;`;
const Sub = styled.span`font-size: 0.8rem; opacity: 0.85; line-height: 1.4;`;
const Cta = styled.span`
  flex: none; font-size: 0.82rem; font-weight: 800; padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: 20px; background: ${theme.colors.secondary}; color: ${theme.colors.secondaryText};
  ${theme.media.xs} { display: none; }
`;

export default function GroupEntryCard() {
  return (
    <Card href="/play">
      <IconBox aria-hidden="true"><LineIcon name="users" size={24} /></IconBox>
      <Text>
        <Title>{HE.QUIZ_GROUP_ENTRY_TITLE}</Title>
        <Sub>{HE.QUIZ_GROUP_ENTRY_SUB}</Sub>
      </Text>
      <Cta aria-hidden="true">{HE.QUIZ_GROUP_ENTRY_CTA} ←</Cta>
    </Card>
  );
}
