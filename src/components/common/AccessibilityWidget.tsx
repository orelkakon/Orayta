'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import {
  A11ySettings, DEFAULT_A11Y, loadA11y, saveA11y, applyA11y, onOpenAccessibility, openAccessibility,
} from '@/lib/a11y';
import Sheet from '@/components/ui/Sheet';
import SegmentedControl from '@/components/ui/SegmentedControl';
import SwitchRow, { RowGroup } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { LineIcon } from './LineIcons';
import { isBareRoute } from '@/lib/routes';

/**
 * Accessibility settings. Opened from the header's a11y button on every page
 * with the top bar (openAccessibility()); screens without a top bar get a
 * floating button instead. Settings persist per device and apply site-wide.
 */

const Fab = styled.button`
  position: fixed; z-index: ${theme.z.feed + 1};
  bottom: calc(18px + ${theme.safe.bottom}); right: calc(18px + ${theme.safe.right});
  width: 46px; height: 46px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  box-shadow: ${theme.shadows.lg};
  transition: transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.92); }
`;

const Label = styled.h3`
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  color: ${theme.colors.textMuted}; margin: ${theme.spacing.md} 4px ${theme.spacing.sm};
  &:first-child { margin-top: 0; }
`;

const Toggles = styled(RowGroup)`margin-top: ${theme.spacing.lg};`;

const Foot = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

const StatementLink = styled(Link)`
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.secondaryText};
  text-decoration: underline; text-underline-offset: 3px;
  min-height: 44px; display: inline-flex; align-items: center;
`;

const FONT_LABELS = [HE.A11Y_FONT_NORMAL, HE.A11Y_FONT_LARGE, HE.A11Y_FONT_XLARGE];

const TOGGLES: { key: Exclude<keyof A11ySettings, 'fontScale'>; label: string; icon: string }[] = [
  { key: 'contrast', label: HE.A11Y_CONTRAST, icon: 'sun' },
  { key: 'readableFont', label: HE.A11Y_READABLE_FONT, icon: 'type' },
  { key: 'underlineLinks', label: HE.A11Y_LINKS, icon: 'list' },
  { key: 'reduceMotion', label: HE.A11Y_MOTION, icon: 'stop' },
];

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_A11Y);
  const pathname = usePathname() ?? '/';

  useEffect(() => {
    const loaded = loadA11y();
    setSettings(loaded);
    applyA11y(loaded);
    return onOpenAccessibility(() => setOpen(true));
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const update = (patch: Partial<A11ySettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveA11y(next);
      applyA11y(next);
      return next;
    });
  };

  // Bare screens without their own a11y button get a floating one. The feed
  // has one in its top bar; the group quiz is full-screen answer tiles and
  // nothing may float over them (saved settings still apply there).
  const showFab = isBareRoute(pathname) && !pathname.startsWith('/play') && pathname !== '/feed';

  return (
    <>
      {showFab && (
        <Fab type="button" aria-label={HE.A11Y_OPEN} onClick={openAccessibility}>
          <LineIcon name="a11y" size={24} strokeWidth={1.9} />
        </Fab>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title={HE.A11Y_TITLE} maxWidth={440}>
        <Label>{HE.A11Y_FONT_SIZE}</Label>
        <SegmentedControl
          ariaLabel={HE.A11Y_FONT_SIZE}
          value={String(settings.fontScale)}
          onChange={v => update({ fontScale: Number(v) as A11ySettings['fontScale'] })}
          options={FONT_LABELS.map((label, i) => ({ value: String(i), label }))}
        />
        <Toggles>
          {TOGGLES.map(t => (
            <SwitchRow
              key={t.key}
              label={t.label}
              icon={<LineIcon name={t.icon} size={20} />}
              checked={settings[t.key]}
              onChange={v => update({ [t.key]: v })}
            />
          ))}
        </Toggles>
        <Foot>
          <StatementLink href="/legal#accessibility">{HE.A11Y_STATEMENT}</StatementLink>
          <Button $variant="danger" $size="sm" onClick={() => update(DEFAULT_A11Y)}>{HE.A11Y_RESET}</Button>
        </Foot>
      </Sheet>
    </>
  );
}
