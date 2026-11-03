'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import Sheet from '@/components/ui/Sheet';
import IconButton from '@/components/ui/IconButton';
import SegmentedControl from '@/components/ui/SegmentedControl';
import SwitchRow, { RowGroup } from '@/components/ui/Switch';
import { FONT_STEPS, ReaderPrefs, ReadingMode } from './useReaderPrefs';

/** Text size with a live preview, reading mode, keep-screen-awake. */
const Label = styled.h3`
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  color: ${theme.colors.textMuted}; margin: ${theme.spacing.lg} 4px ${theme.spacing.sm};
  &:first-child { margin-top: 0; }
`;

const Preview = styled.p`
  min-height: 3.4em; display: flex; align-items: center; justify-content: center; text-align: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border-radius: 16px;
  background: ${theme.colors.surfaceAlt};
  font-family: ${theme.fonts.body}; line-height: 1.7; color: ${theme.colors.text};
  transition: font-size 0.2s ${theme.motion.outStrong};
`;

const SizeRow = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm}; margin-top: ${theme.spacing.sm};`;

const Dots = styled.div`flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 0 6px;`;

const Dot = styled.button<{ $on: boolean; $passed: boolean }>`
  position: relative; width: 12px; height: 12px; border-radius: 50%;
  background: ${p => (p.$passed ? theme.colors.primary : theme.colors.border)};
  transform: scale(${p => (p.$on ? 1.5 : 1)});
  transition: transform 0.2s ${theme.motion.outStrong}, background-color 0.2s ease;
  &::after { content: ''; position: absolute; inset: -14px -8px; }
`;

const Small = styled.span`font-family: ${theme.fonts.body}; font-size: 0.9rem; font-weight: 700;`;
const Big = styled.span`font-family: ${theme.fonts.body}; font-size: 1.35rem; font-weight: 700;`;

const Awake = styled(RowGroup)`margin-top: ${theme.spacing.lg};`;

interface Props { open: boolean; onClose: () => void; prefs: ReaderPrefs }

export default function ReaderSettingsSheet({ open, onClose, prefs }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title={HE.READER_SETTINGS} maxWidth={440}>
      <Label>{HE.READER_SIZE}</Label>
      <Preview style={{ fontSize: `calc(1.05rem * ${prefs.scale})` }} aria-hidden="true">{HE.READER_PREVIEW}</Preview>
      <SizeRow>
        <IconButton $variant="tonal" disabled={prefs.step === 0} onClick={() => prefs.setStep(prefs.step - 1)} aria-label={HE.READER_SMALLER}>
          <Small>{HE.READER_GLYPH}</Small>
        </IconButton>
        <Dots role="radiogroup" aria-label={HE.READER_SIZE}>
          {FONT_STEPS.map((_, i) => (
            <Dot
              key={i} type="button" role="radio" aria-checked={i === prefs.step} aria-label={String(i + 1)}
              $on={i === prefs.step} $passed={i <= prefs.step}
              onClick={() => prefs.setStep(i)}
            />
          ))}
        </Dots>
        <IconButton $variant="tonal" disabled={prefs.step === FONT_STEPS.length - 1} onClick={() => prefs.setStep(prefs.step + 1)} aria-label={HE.READER_LARGER}>
          <Big>{HE.READER_GLYPH}</Big>
        </IconButton>
      </SizeRow>

      <Label>{HE.READER_MODE}</Label>
      <SegmentedControl<ReadingMode>
        ariaLabel={HE.READER_MODE}
        value={prefs.mode}
        onChange={prefs.setMode}
        options={[
          { value: 'regular', label: HE.READER_MODE_REGULAR },
          { value: 'sepia', label: HE.READER_MODE_SEPIA },
          { value: 'night', label: HE.READER_MODE_NIGHT },
        ]}
      />

      <Awake>
        <SwitchRow
          icon={<LineIcon name="sun" size={20} />}
          label={HE.READER_AWAKE}
          checked={prefs.awake}
          onChange={prefs.setAwake}
        />
      </Awake>
    </Sheet>
  );
}
