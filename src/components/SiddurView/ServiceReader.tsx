'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { Button } from '@/components/ui/Button';
import { getService, SERVICES } from '@/lib/siddur';
import type { ServiceId } from '@/lib/siddur';
import ReaderBar from './ReaderBar';
import ContentsSheet from './ContentsSheet';
import PrayerSectionView from './PrayerSectionView';
import ReaderHeader from './ReaderHeader';
import { useServiceText } from './useServiceText';
import { useScrollSpy, jumpTo } from './useScrollSpy';
import { useReaderPrefs } from '@/components/Reader/useReaderPrefs';
import { useWakeLock } from '@/components/Reader/useWakeLock';
import ReaderSettingsSheet from '@/components/Reader/ReaderSettingsSheet';
import ResumeChip from '@/components/Reader/ResumeChip';
import { loadPosition, savePosition } from '@/lib/siddur/position';
import { israelDateKey } from '@/lib/dailyLearning/kinds';
import { usePrayerDay } from './usePrayerDay';

const Page = styled.div`display: flex; flex-direction: column;`;

/* The prayer text keeps a comfortable reading measure on wide screens. */
const Body = styled.article`
  padding-top: ${theme.spacing.sm};
  max-width: ${theme.layout.reading}; width: 100%; margin-inline: auto;
`;

const ErrorBox = styled.div`
  margin: ${theme.spacing.xl} 0; padding: ${theme.spacing.lg}; text-align: center;
  border-radius: ${theme.radii.lg}; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  color: ${theme.colors.textMuted}; display: flex; flex-direction: column; gap: ${theme.spacing.sm}; align-items: center;
`;



const End = styled.footer`
  margin-top: ${theme.spacing.xl}; padding: ${theme.spacing.lg} 0; text-align: center;
  border-top: 1px solid ${theme.colors.borderLight};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm}; align-items: center;
`;

const EndLinks = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap; justify-content: center;`;

const EndLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 16px;
  border-radius: 999px; border: 1px solid ${theme.colors.border}; font-weight: 600; color: ${theme.colors.primary};
  &:hover { border-color: ${theme.colors.secondary}; }
`;

const Source = styled.p`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textLight};`;

export default function ServiceReader({ id }: { id: ServiceId }) {
  const service = getService(id);
  const { nodes, status, reload } = useServiceText(id);
  const prefs = useReaderPrefs();
  useWakeLock(prefs.awake);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resumeTo, setResumeTo] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ids = useMemo(() => service.sections.map(s => s.id), [service]);
  const { active, progress } = useScrollSpy(ids, rootRef, barRef);
  const [contentsOpen, setContentsOpen] = useState(false);
  // Client-only: the server has no idea what day it is for the reader.
  const day = usePrayerDay(id);

  // Deep link (#shema): jump once the text is laid out. Without one, offer
  // to continue from where the reader was in this service earlier today.
  const linkedRef = useRef(false);
  useEffect(() => {
    if (status !== 'ready' || linkedRef.current) return;
    linkedRef.current = true;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) { requestAnimationFrame(() => jumpTo(hash, false)); return; }
    const saved = loadPosition(id, israelDateKey(new Date()));
    if (saved && saved !== ids[0] && ids.includes(saved)) setResumeTo(saved);
  }, [status, id, ids]);

  useEffect(() => {
    if (status === 'ready' && active) savePosition(id, israelDateKey(new Date()), active);
  }, [status, active, id]);

  const jumpFromSheet = useCallback((target: string) => {
    setContentsOpen(false);
    // Let the sheet release the body scroll lock (after its exit) before scrolling.
    window.setTimeout(() => jumpTo(target), 300);
  }, []);

  const others = SERVICES.filter(s => s.id !== id);

  return (
    <Page ref={rootRef} style={{ ['--siddur-scale' as string]: prefs.scale }}>
      <ReaderHeader service={service} day={day} onJump={jumpTo} />
      <ReaderBar
        ref={barRef} service={service} day={day} active={active} progress={progress}
        onJump={jumpTo} onContents={() => setContentsOpen(true)} onSettings={() => setSettingsOpen(true)}
      />
      {status === 'error' ? (
        <ErrorBox role="alert">
          <span>{HE.SIDDUR_LOAD_ERROR}</span>
          <Button $size="sm" onClick={() => void reload()}>{HE.SIDDUR_RETRY}</Button>
        </ErrorBox>
      ) : (
        <Body aria-busy={status === 'loading'}>
          {service.sections.map(s => (
            <PrayerSectionView key={s.id} section={s} nodes={nodes} loading={status === 'loading'} day={day} />
          ))}
        </Body>
      )}
      <End>
        <EndLinks>
          {others.map(o => <EndLink key={o.id} href={`/siddur/${o.id}`}><LineIcon name={o.icon} size={16} />{o.title}</EndLink>)}
        </EndLinks>
        <Source>{HE.SIDDUR_SOURCE}</Source>
      </End>
      {day && (
        <ContentsSheet open={contentsOpen} service={service} active={active} day={day} onJump={jumpFromSheet} onClose={() => setContentsOpen(false)} />
      )}
      <ReaderSettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} prefs={prefs} />
      {resumeTo && (
        <ResumeChip
          title={service.sections.find(x => x.id === resumeTo)?.title ?? ''}
          onGo={() => jumpTo(resumeTo)}
        />
      )}
    </Page>
  );
}
