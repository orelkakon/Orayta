'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { getService, SERVICES } from '@/lib/siddur';
import type { ServiceId } from '@/lib/siddur';
import ReaderBar from './ReaderBar';
import ContentsSheet from './ContentsSheet';
import PrayerSectionView from './PrayerSectionView';
import ReaderHeader from './ReaderHeader';
import { useServiceText } from './useServiceText';
import { useScrollSpy, jumpTo } from './useScrollSpy';
import { useSiddurFont } from './useSiddurFont';
import { usePrayerDay } from './usePrayerDay';

const Page = styled.div`display: flex; flex-direction: column;`;

const Body = styled.article`padding-top: ${theme.spacing.sm};`;

const ErrorBox = styled.div`
  margin: ${theme.spacing.xl} 0; padding: ${theme.spacing.lg}; text-align: center;
  border-radius: ${theme.radii.lg}; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  color: ${theme.colors.textMuted}; display: flex; flex-direction: column; gap: ${theme.spacing.sm}; align-items: center;
`;

const Retry = styled.button`
  min-height: 40px; padding: 0 18px; border-radius: 999px; font-weight: 700;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.primary};
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
  const font = useSiddurFont();
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ids = useMemo(() => service.sections.map(s => s.id), [service]);
  const { active, progress } = useScrollSpy(ids, rootRef, barRef);
  const [contentsOpen, setContentsOpen] = useState(false);
  // Client-only: the server has no idea what day it is for the reader.
  const day = usePrayerDay(id);

  // Deep link (#shema): jump once the text is laid out.
  const linkedRef = useRef(false);
  useEffect(() => {
    if (status !== 'ready' || linkedRef.current) return;
    linkedRef.current = true;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) requestAnimationFrame(() => jumpTo(hash, false));
  }, [status]);

  const jumpFromSheet = useCallback((target: string) => {
    setContentsOpen(false);
    // Let the modal release the body scroll lock before scrolling.
    requestAnimationFrame(() => requestAnimationFrame(() => jumpTo(target)));
  }, []);

  const others = SERVICES.filter(s => s.id !== id);

  return (
    <Page ref={rootRef} style={{ ['--siddur-scale' as string]: font.scale }}>
      <ReaderHeader
        service={service} day={day} onJump={jumpTo}
        canShrink={font.canShrink} canGrow={font.canGrow} onSmaller={font.smaller} onLarger={font.larger}
      />
      <ReaderBar
        ref={barRef} service={service} day={day} active={active} progress={progress}
        onJump={jumpTo} onContents={() => setContentsOpen(true)}
      />
      {status === 'error' ? (
        <ErrorBox role="alert">
          <span>{HE.SIDDUR_LOAD_ERROR}</span>
          <Retry onClick={() => void reload()}>{HE.SIDDUR_RETRY}</Retry>
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
      {contentsOpen && day && (
        <ContentsSheet service={service} active={active} day={day} onJump={jumpFromSheet} onClose={() => setContentsOpen(false)} />
      )}
    </Page>
  );
}
