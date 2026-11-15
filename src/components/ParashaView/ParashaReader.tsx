'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { ParashaWeek } from '@/types/dailyLearning';
import type { ParashaPart } from '@/lib/parasha/refs';
import { LineIcon } from '@/components/common/LineIcons';
import IconButton from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { SkeletonText } from '@/components/ui/Skeleton';
import { useReaderPrefs } from '@/components/Reader/useReaderPrefs';
import { useWakeLock } from '@/components/Reader/useWakeLock';
import ReaderSettingsSheet from '@/components/Reader/ReaderSettingsSheet';
import LearnTextView from '@/components/LearnView/LearnTextView';
import { useParashaText } from './useParasha';

/**
 * One part of the week's reading (an aliya, the haftara or the whole
 * parasha): the hub reader's sticky bar (back · title · text settings),
 * numbered verses under chapter headings, then the next aliya.
 */
const Bar = styled.div`
  position: sticky; top: var(--header-h, 56px); z-index: ${theme.z.sticky};
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  margin: calc(-1 * ${theme.spacing.md}) calc(-1 * ${theme.layout.gutter}) ${theme.spacing.md};
  padding: 8px ${theme.layout.gutter};
  background: color-mix(in srgb, ${theme.colors.background} 90%, transparent);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  border-bottom: 1px solid ${theme.colors.borderLight};
  ${theme.up.sm} { margin-top: calc(-1 * ${theme.spacing.xl}); }
`;

const Title = styled.h1`
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  font-size: ${theme.fontSizes.lg}; line-height: 1.25; color: ${theme.colors.text};
  small { font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.xs}; font-weight: 500; color: ${theme.colors.textMuted}; }
  span, small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

const Foot = styled.footer`
  max-width: 720px; margin: ${theme.spacing.xl} auto 0; width: 100%;
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
  padding-top: ${theme.spacing.lg}; border-top: 1px solid ${theme.colors.borderLight};
`;

const Source = styled.p`
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; text-align: center;
  a { color: ${theme.colors.secondary}; font-weight: 700; }
`;

const ErrorBox = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl} ${theme.spacing.md}; color: ${theme.colors.textMuted}; text-align: center;
`;

interface Props { week: ParashaWeek; date: string | null; part: ParashaPart }

function partTitle(week: ParashaWeek, part: ParashaPart): string {
  if (part === 'all') return HE.PARASHA_TITLE(week.name);
  if (part === 'h') return `${HE.PARASHA_HAFTARAH} · ${HE.PARASHA_TITLE(week.name)}`;
  return `${week.aliyot[part].label} · ${HE.PARASHA_TITLE(week.name)}`;
}

export default function ParashaReader({ week, date, part }: Props) {
  const router = useRouter();
  const prefs = useReaderPrefs();
  useWakeLock(prefs.awake);
  const [settings, setSettings] = useState(false);
  const { load, retry } = useParashaText(date, part);

  const title = partTitle(week, part);
  const next = typeof part === 'number' && part + 1 < week.aliyot.length ? part + 1 : null;
  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push('/parasha');
  };

  return (
    <div style={{ ['--siddur-scale' as string]: prefs.scale }} aria-label={HE.PARASHA_READER_ARIA(title)}>
      <Bar>
        <IconButton $variant="tonal" $size="sm" onClick={back} aria-label={HE.READER_BACK}>
          <LineIcon name="chevronBack" size={20} strokeWidth={2.2} />
        </IconButton>
        <Title>
          <span>{title}</span>
          {load.state === 'ready' && <small>{load.data.heRef}</small>}
        </Title>
        <IconButton $variant="tonal" $size="sm" onClick={() => setSettings(true)} aria-label={HE.READER_SETTINGS_OPEN}>
          <LineIcon name="type" size={19} strokeWidth={1.9} />
        </IconButton>
      </Bar>

      {load.state === 'loading' && <SkeletonText lines={12} lineHeight="16px" />}
      {load.state === 'error' && (
        <ErrorBox role="alert">
          {HE.PARASHA_TEXT_ERROR}
          <Button $size="sm" onClick={retry}>{HE.PARASHA_RETRY}</Button>
        </ErrorBox>
      )}
      {load.state === 'ready' && (
        <>
          <LearnTextView text={load.data} />
          <Foot>
            {next !== null && (
              <Button onClick={() => router.replace(`/parasha?part=${next}`, { scroll: true })}>
                {week.aliyot[next].label}<LineIcon name="chevronBack" size={18} strokeWidth={2} />
              </Button>
            )}
            <Source>
              {HE.PARASHA_SOURCE}{load.data.version ? ` · ${load.data.version}` : ''}{' · '}
              <a href={load.data.url} target="_blank" rel="noopener noreferrer">{HE.PARASHA_OPEN_SEFARIA} ↗</a>
            </Source>
          </Foot>
        </>
      )}
      <ReaderSettingsSheet open={settings} onClose={() => setSettings(false)} prefs={prefs} />
    </div>
  );
}
