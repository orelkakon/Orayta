'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import SwitchRow, { RowGroup } from '@/components/ui/Switch';
import { cacheEnabled } from '@/lib/interests';

/** Site settings: personalising home by interest, on for everyone or off for everyone. */
const Card = styled.section`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;
const Title = styled.h2`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.primary};
`;
const Note = styled.p<{ $error?: boolean }>`
  font-size: ${theme.fontSizes.sm}; line-height: 1.5;
  color: ${p => (p.$error ? theme.colors.error : theme.colors.textMuted)};
`;

export default function AdminHomeSettings() {
  const [on, setOn] = useState<boolean | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // A unique URL skips the CDN copy; the server answers from its (invalidated) data cache.
    fetch(`/api/config/home?t=${Date.now()}`)
      .then(r => r.json() as Promise<{ personalize: boolean }>)
      .then(c => setOn(c.personalize))
      .catch(() => setError(true));
  }, []);

  const change = async (next: boolean) => {
    const prev = on;
    setOn(next);
    setError(false);
    const res = await fetch('/api/config/home', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personalize: next }),
    }).catch(() => null);
    if (res?.ok) cacheEnabled(next);
    else { setOn(prev); setError(true); }
  };

  return (
    <Card aria-labelledby="admin-home-settings">
      <Title id="admin-home-settings"><LineIcon name="sliders" size={18} />{HE.ADMIN_HOME_SETTINGS}</Title>
      {on !== null && (
        <RowGroup>
          <SwitchRow icon={<LineIcon name="home" size={20} />} label={HE.ADMIN_HOME_PERSONALIZE} checked={on} onChange={change} />
        </RowGroup>
      )}
      <Note $error={error}>{error ? HE.ADMIN_HOME_ERROR : on === false ? HE.ADMIN_HOME_OFF_NOTE : HE.ADMIN_HOME_ON_NOTE}</Note>
    </Card>
  );
}
