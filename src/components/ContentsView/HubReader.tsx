'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import IconButton from '@/components/ui/IconButton';
import { useReaderPrefs } from '@/components/Reader/useReaderPrefs';
import { useWakeLock } from '@/components/Reader/useWakeLock';
import ReaderSettingsSheet from '@/components/Reader/ReaderSettingsSheet';
import type { ContentSection } from '@/lib/contentsSections';
import type { SiddurSection } from '@/lib/prayers/types';
import ContentReader from './ContentReader';
import SiddurSectionBody from './SiddurSectionBody';

/**
 * The shared reader shell for everything in the prayers hub: a sticky bar
 * (back · title · text settings) under the app header, the text on a
 * comfortable measure, the reader's text size / reading mode / keep-awake.
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
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px;
  font-size: ${theme.fontSizes.xl}; color: ${theme.colors.text};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  svg { flex-shrink: 0; color: ${theme.colors.gold}; }
`;

const Column = styled.div`max-width: ${theme.layout.reading}; margin-inline: auto;`;

interface Props {
  title: string;
  icon: string;
  section?: ContentSection;
  extra?: SiddurSection;
  initialChapter: number;
}

export default function HubReader({ title, icon, section, extra, initialChapter }: Props) {
  const router = useRouter();
  const prefs = useReaderPrefs();
  useWakeLock(prefs.awake);
  const [settings, setSettings] = useState(false);

  const back = () => {
    const internal = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (internal && window.history.length > 1) router.back();
    else router.push('/content');
  };

  return (
    <div style={{ ['--siddur-scale' as string]: prefs.scale }} aria-label={HE.PRAYERS_READER_ARIA(title)}>
      <Bar>
        <IconButton $variant="tonal" $size="sm" onClick={back} aria-label={HE.READER_BACK}>
          <LineIcon name="chevronBack" size={20} strokeWidth={2.2} />
        </IconButton>
        <Title><LineIcon name={icon} size={20} strokeWidth={1.8} />{title}</Title>
        <IconButton $variant="tonal" $size="sm" onClick={() => setSettings(true)} aria-label={HE.READER_SETTINGS_OPEN}>
          <LineIcon name="type" size={19} strokeWidth={1.9} />
        </IconButton>
      </Bar>
      <Column>
        {section && <ContentReader section={section} initialChapter={initialChapter} />}
        {extra && <SiddurSectionBody section={extra} />}
      </Column>
      <ReaderSettingsSheet open={settings} onClose={() => setSettings(false)} prefs={prefs} />
    </div>
  );
}
