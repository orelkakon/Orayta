'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';

/** Cross-links between the three "near me" pages (the search location carries over). */
const Wrap = styled.nav`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Label = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.textMuted};`;
const Row = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;

const Item = styled(Link)`
  flex: 1 1 140px; display: flex; align-items: center; gap: 10px; min-height: 56px; padding: 8px 12px;
  border-radius: 16px; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.sm}; font-weight: 700; color: ${theme.colors.text};
  transition: transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.97); }
  & > span {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: ${theme.colors.primary}; background: ${theme.colors.goldSoft};
  }
`;

export default function AlsoNearby({ current }: { current: string }) {
  return (
    <Wrap aria-label={HE.NB_ALSO}>
      <Label>{HE.NB_ALSO}</Label>
      <Row>
        {HE.NB_TILES.filter(t => t.href !== current).map(t => (
          <Item key={t.href} href={t.href}>
            <span aria-hidden="true"><LineIcon name={t.icon} size={19} /></span>{t.label}
          </Item>
        ))}
      </Row>
    </Wrap>
  );
}
