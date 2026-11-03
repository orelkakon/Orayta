'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';
import { LineIcon } from '@/components/common/LineIcons';
import { useDarkMode } from '@/components/common/ThemeContext';
import IconButton from '@/components/ui/IconButton';
import { openNotifications } from '@/lib/push/client';
import { openAccessibility } from '@/lib/a11y';
import DesktopNav from './DesktopNav';

/**
 * The espresso app bar. It runs under the iPhone status bar (viewport-fit
 * cover + black-translucent), padding itself down by the safe-area inset.
 * Compact screens: brand + three quick actions (the tab bar navigates).
 * Desktop: brand + grouped nav + actions.
 */
const Bar = styled.header`
  background: ${theme.colors.chrome};
  color: ${theme.colors.onChrome};
  padding-top: ${theme.safe.top};
  border-bottom: 1px solid color-mix(in srgb, ${theme.colors.gold} 32%, transparent);
`;

const Inner = styled.div`
  max-width: ${theme.layout.wide}; margin: 0 auto;
  height: 56px;
  padding-left: max(${theme.spacing.sm}, ${theme.safe.left});
  padding-right: max(${theme.layout.gutter}, ${theme.safe.right});
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  ${theme.up.wide} { height: 64px; padding-left: max(${theme.layout.gutter}, ${theme.safe.left}); }
`;

const Brand = styled(Link)`
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  color: inherit; min-height: 44px;
  transition: opacity 0.15s ease;
  &:active { opacity: 0.7; }
`;

const Words = styled.span`display: flex; flex-direction: column; line-height: 1.1;`;

const Name = styled.span`
  font-family: ${theme.fonts.body}; font-size: 1.3rem; font-weight: 700; letter-spacing: -0.01em;
`;

const Tagline = styled.span`
  font-size: ${theme.fontSizes.xxs}; letter-spacing: 0.04em;
  color: color-mix(in srgb, ${theme.colors.onChrome} 62%, transparent);
  @media (max-width: 359px) { display: none; }
`;

const Spacer = styled.div`flex: 1; min-width: 0;`;

const Actions = styled.div`display: flex; align-items: center; gap: 2px;`;

interface Props {
  pathname: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function AppHeader({ pathname, isAdmin, onLogout }: Props) {
  const { isDark, toggle } = useDarkMode();
  return (
    <Bar>
      <Inner>
        <Brand href="/" aria-label={HE.HEADER_HOME_ARIA}>
          <OraytaLogo size={34} />
          <Words aria-hidden="true">
            <Name>{HE.APP_NAME}</Name>
            <Tagline>{HE.HEADER_TAGLINE}</Tagline>
          </Words>
        </Brand>
        <Spacer>
          <DesktopNav pathname={pathname} isAdmin={isAdmin} onLogout={onLogout} />
        </Spacer>
        <Actions>
          <IconButton $variant="chrome" onClick={openAccessibility} aria-label={HE.A11Y_OPEN} title={HE.A11Y_TITLE}>
            <LineIcon name="a11y" size={21} strokeWidth={1.8} />
          </IconButton>
          <IconButton $variant="chrome" onClick={openNotifications} aria-label={HE.PUSH_OPEN_ARIA} title={HE.PUSH_TITLE}>
            <LineIcon name="bell" size={20} strokeWidth={1.8} />
          </IconButton>
          <IconButton
            $variant="chrome"
            onClick={toggle}
            aria-label={isDark ? HE.ARIA_THEME_TO_LIGHT : HE.ARIA_THEME_TO_DARK}
            aria-pressed={isDark}
            title={isDark ? HE.THEME_LIGHT : HE.THEME_DARK}
          >
            <LineIcon name={isDark ? 'sun' : 'moon'} size={20} strokeWidth={1.8} />
          </IconButton>
        </Actions>
      </Inner>
    </Bar>
  );
}
