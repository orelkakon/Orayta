'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { A11ySettings, DEFAULT_A11Y, loadA11y, saveA11y, applyA11y } from '@/lib/a11y';

const Fab = styled.button`
  position: fixed; bottom: 18px; right: 18px; z-index: 1200;
  width: 46px; height: 46px; border-radius: 50%;
  background: ${theme.colors.primary}; color: white;
  display: flex; align-items: center; justify-content: center;
  box-shadow: ${theme.shadows.lg};
  border: 2px solid rgba(255, 255, 255, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: scale(1.08); }
  &:active { transform: scale(0.94); }
`;

const Panel = styled.div`
  position: fixed; bottom: 74px; right: 18px; z-index: 1200;
  width: 250px; direction: rtl;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.lg};
  padding: ${theme.spacing.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const PanelTitle = styled.div`
  font-family: ${theme.fonts.body}; font-size: 1rem; font-weight: 700;
  color: ${theme.colors.primary};
  padding-bottom: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.borderLight};
  display: flex; align-items: center; gap: 6px;
`;

const RowLabel = styled.div`font-size: 0.82rem; font-weight: 600; color: ${theme.colors.text};`;

const SegmentRow = styled.div`display: flex; gap: 6px;`;

const SegBtn = styled.button<{ $active: boolean }>`
  flex: 1; padding: 6px 4px; font-size: 0.76rem; font-weight: 600;
  border-radius: ${theme.radii.sm};
  border: 1.5px solid ${p => p.$active ? theme.colors.primary : theme.colors.border};
  background: ${p => p.$active ? theme.colors.primary : theme.colors.surface};
  color: ${p => p.$active ? 'white' : theme.colors.textMuted};
  transition: all 0.15s;
`;

const ToggleRow = styled.button`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${theme.spacing.sm}; width: 100%;
  padding: 7px ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.surfaceAlt};
  font-size: 0.82rem; font-weight: 600; color: ${theme.colors.text};
  transition: background 0.15s;
  &:hover { background: ${theme.colors.borderLight}; }
`;

const Knob = styled.span<{ $on: boolean }>`
  width: 34px; height: 19px; border-radius: 10px; flex-shrink: 0;
  background: ${p => p.$on ? theme.colors.success : theme.colors.border};
  position: relative; transition: background 0.15s;
  &::after {
    content: ''; position: absolute; top: 2px;
    inset-inline-start: ${p => p.$on ? '17px' : '2px'};
    width: 15px; height: 15px; border-radius: 50%;
    background: white; transition: inset-inline-start 0.15s;
  }
`;

const ResetBtn = styled.button`
  font-size: 0.78rem; font-weight: 600; color: ${theme.colors.error};
  padding: 6px; border-radius: ${theme.radii.sm};
  border: 1px solid ${theme.colors.borderLight};
  &:hover { background: ${theme.colors.bgError}; }
`;

function A11yIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2.2" />
      <path d="M12 8c-2.6 0-5.2-.4-7.4-1l-.6 2c1.7.5 3.6.8 5.5 1l-.3 3.5-1.9 6.2 2 .6 1.9-6h1.6l1.9 6 2-.6-1.9-6.2-.3-3.5c1.9-.2 3.8-.5 5.5-1l-.6-2c-2.2.6-4.8 1-7.4 1z" />
    </svg>
  );
}

const FONT_LABELS = [HE.A11Y_FONT_NORMAL, HE.A11Y_FONT_LARGE, HE.A11Y_FONT_XLARGE];

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_A11Y);

  useEffect(() => {
    const loaded = loadA11y();
    setSettings(loaded);
    applyA11y(loaded);
  }, []);

  const update = (patch: Partial<A11ySettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveA11y(next);
      applyA11y(next);
      return next;
    });
  };

  const toggles: { key: keyof A11ySettings; label: string }[] = [
    { key: 'contrast',       label: HE.A11Y_CONTRAST },
    { key: 'readableFont',   label: HE.A11Y_READABLE_FONT },
    { key: 'underlineLinks', label: HE.A11Y_LINKS },
    { key: 'reduceMotion',   label: HE.A11Y_MOTION },
  ];

  return (
    <>
      {open && (
        <Panel role="dialog" aria-label={HE.A11Y_TITLE}>
          <PanelTitle><A11yIcon />{HE.A11Y_TITLE}</PanelTitle>
          <RowLabel>{HE.A11Y_FONT_SIZE}</RowLabel>
          <SegmentRow>
            {FONT_LABELS.map((label, i) => (
              <SegBtn
                key={label}
                $active={settings.fontScale === i}
                onClick={() => update({ fontScale: i as A11ySettings['fontScale'] })}
              >
                {label}
              </SegBtn>
            ))}
          </SegmentRow>
          {toggles.map(t => (
            <ToggleRow
              key={t.key}
              aria-pressed={Boolean(settings[t.key])}
              onClick={() => update({ [t.key]: !settings[t.key] })}
            >
              {t.label}
              <Knob $on={Boolean(settings[t.key])} />
            </ToggleRow>
          ))}
          <ResetBtn onClick={() => update(DEFAULT_A11Y)}>↺ {HE.A11Y_RESET}</ResetBtn>
        </Panel>
      )}
      <Fab
        aria-label={HE.A11Y_OPEN}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {open ? '✕' : <A11yIcon />}
      </Fab>
    </>
  );
}
