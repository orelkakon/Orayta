'use client';

import { useEffect, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { useRole } from '@/components/common/RoleContext';
import { currentEndpoint } from '@/lib/push/client';
import { usePushSettings } from './usePushSettings';
import TimePicker from './TimePicker';
import PushToggles from './PushToggles';
import { IosInstallNotice, DeniedNotice, UnsupportedNotice } from './PushStateNotice';
import {
  EXIT_MS, Backdrop, Sheet, Grip, Head, Medallion, TitleBox, Title, Sub, CloseBtn, OnBadge,
  PrimaryBtn, QuietBtn, ErrorLine,
} from './sheetStyles';

interface Props { onClose: () => void; }

/** Admin only: a real push through the push service with today's content. */
async function serverTest(kind: 'daily' | 'hilula') {
  const endpoint = await currentEndpoint();
  if (!endpoint) return;
  await fetch('/api/push/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint, kind }) });
}

export default function NotificationsSheet({ onClose }: Props) {
  const [out, setOut] = useState(false);
  const { view, prefs, busy, save, enable, update, disable, test } = usePushSettings(true);
  const role = useRole();

  const close = () => { setOut(true); window.setTimeout(onClose, EXIT_MS); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Backdrop $out={out} onClick={close} />
      <Sheet $out={out} role="dialog" aria-modal="true" aria-labelledby="push-sheet-title">
        <Grip />
        <Head>
          <Medallion $ring={view === 'on'}><span><LineIcon name="bell" size={24} /></span></Medallion>
          <TitleBox>
            <Title id="push-sheet-title">{HE.PUSH_TITLE}{view === 'on' && <OnBadge>{HE.PUSH_ON_BADGE}</OnBadge>}</Title>
            <Sub>{HE.PUSH_SUBTITLE}</Sub>
          </TitleBox>
          <CloseBtn type="button" aria-label={HE.CLOSE} onClick={close}><LineIcon name="close" size={18} /></CloseBtn>
        </Head>

        {view === 'ios-install' && <IosInstallNotice />}
        {view === 'unsupported' && <UnsupportedNotice />}
        {view === 'denied' && <DeniedNotice />}

        {(view === 'off' || view === 'on') && (
          <>
            <TimePicker value={prefs.dailyMinutes} onChange={m => update({ dailyMinutes: m })} />
            <PushToggles prefs={prefs} onChange={update} />
          </>
        )}

        {view === 'off' && (
          <PrimaryBtn type="button" disabled={busy} onClick={() => void enable()}>
            {busy ? HE.PUSH_ENABLING : HE.PUSH_ENABLE}
          </PrimaryBtn>
        )}

        {view === 'on' && (
          <>
            <QuietBtn type="button" onClick={() => void test()}>
              <LineIcon name="send" size={16} /> {HE.PUSH_TEST}
            </QuietBtn>
            {role === 'admin' && (
              <>
                <QuietBtn type="button" onClick={() => void serverTest('daily')}>{HE.PUSH_ADMIN_TEST_DAILY}</QuietBtn>
                <QuietBtn type="button" onClick={() => void serverTest('hilula')}>{HE.PUSH_ADMIN_TEST_HILULA}</QuietBtn>
              </>
            )}
            <QuietBtn type="button" $danger disabled={busy} onClick={() => void disable()}>{HE.PUSH_DISABLE}</QuietBtn>
          </>
        )}

        {save === 'error' && <ErrorLine role="alert">{HE.PUSH_ERROR}</ErrorLine>}
        {save === 'saved' && view === 'on' && <Sub role="status" style={{ textAlign: 'center' }}>✓ {HE.PUSH_SAVED}</Sub>}
      </Sheet>
    </>
  );
}
