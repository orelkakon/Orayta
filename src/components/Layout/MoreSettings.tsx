'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { useDarkMode, ThemeMode } from '@/components/common/ThemeContext';
import SegmentedControl from '@/components/ui/SegmentedControl';
import SwitchRow, { RowGroup } from '@/components/ui/Switch';
import { openNotifications } from '@/lib/push/client';
import { openAccessibility } from '@/lib/a11y';
import { requestInstall } from '@/lib/install';
import { useInstallMode } from '@/components/common/useInstallMode';
import { GroupTitle } from './MoreGrid';

/** Settings + account block at the bottom of the "עוד" sheet. */
const ThemeRow = styled.div`
  padding: 12px ${theme.spacing.md};
  display: flex; flex-direction: column; gap: 10px;
`;

const RowLabel = styled.span`
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  font-size: ${theme.fontSizes.md}; font-weight: 500; color: ${theme.colors.text};
  svg { color: ${theme.colors.textMuted}; }
`;

const rowCss = css`
  width: 100%; min-height: 52px;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: 8px ${theme.spacing.md};
  font-size: ${theme.fontSizes.md}; font-weight: 500; color: ${theme.colors.text}; text-align: start;
  & > svg:first-child { color: ${theme.colors.textMuted}; }
  & > span { flex: 1; }
  & > svg:last-child { color: ${theme.colors.textLight}; }
  &:active { background: color-mix(in srgb, ${theme.colors.text} 5%, transparent); }
`;

const ActionRow = styled.button`${rowCss}`;
const LinkRow = styled(Link)`${rowCss}`;

const Legal = styled.nav`
  display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 16px;
  margin-top: ${theme.spacing.lg};
  a {
    font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
    min-height: 32px; display: inline-flex; align-items: center;
  }
`;

interface Props {
  isAdmin: boolean;
  onLogout: () => void;
  tickerOn: boolean;
  onTickerChange: (on: boolean) => void;
  onNavigate: () => void;
}

export default function MoreSettings({ isAdmin, onLogout, tickerOn, onTickerChange, onNavigate }: Props) {
  const { mode, setMode } = useDarkMode();
  const install = useInstallMode();
  const chevron = <LineIcon name="chevron" size={18} />;
  return (
    <>
      <GroupTitle>{HE.MORE_SETTINGS}</GroupTitle>
      <RowGroup>
        <ThemeRow>
          <RowLabel><LineIcon name="moon" size={20} />{HE.MORE_THEME}</RowLabel>
          <SegmentedControl<ThemeMode>
            ariaLabel={HE.MORE_THEME}
            value={mode}
            onChange={setMode}
            options={[
              { value: 'light', label: HE.MORE_THEME_LIGHT },
              { value: 'dark', label: HE.MORE_THEME_DARK },
              { value: 'system', label: HE.MORE_THEME_SYSTEM },
            ]}
          />
        </ThemeRow>
        <ActionRow type="button" onClick={openNotifications}>
          <LineIcon name="bell" size={20} /><span>{HE.MORE_NOTIFICATIONS}</span>{chevron}
        </ActionRow>
        <ActionRow type="button" onClick={openAccessibility}>
          <LineIcon name="a11y" size={20} /><span>{HE.MORE_A11Y}</span>{chevron}
        </ActionRow>
        {install && (
          <ActionRow type="button" onClick={requestInstall}>
            <LineIcon name="home" size={20} /><span>{HE.MORE_INSTALL}</span>{chevron}
          </ActionRow>
        )}
        <SwitchRow
          icon={<LineIcon name="candle" size={20} />}
          label={HE.MORE_TICKER}
          checked={tickerOn}
          onChange={onTickerChange}
        />
      </RowGroup>

      <GroupTitle>{HE.MORE_ADMIN}</GroupTitle>
      <RowGroup>
        {isAdmin && (
          <LinkRow href="/admin" onClick={onNavigate}>
            <LineIcon name="chart" size={20} /><span>{HE.NAV_ADMIN_STATS}</span>{chevron}
          </LinkRow>
        )}
        {isAdmin
          ? <ActionRow type="button" onClick={onLogout}><LineIcon name="logout" size={20} /><span>{HE.NAV_LOGOUT}</span></ActionRow>
          : <LinkRow href="/login" onClick={onNavigate}><LineIcon name="key" size={20} /><span>{HE.NAV_ADMIN_LOGIN}</span>{chevron}</LinkRow>}
      </RowGroup>

      <Legal aria-label={HE.FOOTER_ARIA}>
        <Link href="/legal#terms" onClick={onNavigate}>{HE.FOOTER_TERMS}</Link>
        <Link href="/legal#privacy" onClick={onNavigate}>{HE.FOOTER_PRIVACY}</Link>
        <Link href="/legal#accessibility" onClick={onNavigate}>{HE.FOOTER_ACCESSIBILITY}</Link>
      </Legal>
    </>
  );
}
