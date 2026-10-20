'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayRosterEntry } from '@/types/play';
import PlaySheet from './PlaySheet';
import QrCode from './QrCode';
import InviteActions from './InviteActions';
import { joinUrl } from './playClient';
import { GhostButton, GoldButton, Sub } from './playStyles';

/** The host's secondary panels: remote control, projector link, players, confirms. */
export type HostSheet =
  | { kind: 'remote' } | { kind: 'screen' } | { kind: 'players' } | { kind: 'end' } | { kind: 'invite' }
  | { kind: 'kick'; id: string; name: string };

const Col = styled.div`display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md}; text-align: center;`;
const Row = styled.div`display: flex; gap: ${theme.spacing.sm}; justify-content: center; flex-wrap: wrap;`;
const Link = styled.code`
  direction: ltr;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.game.inkMuted};
  word-break: break-all;
`;
const List = styled.ul`
  list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px;
  li {
    display: flex; align-items: center; gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radii.md}; background: ${theme.game.glass};
  }
  li span:nth-child(2) { flex: 1; font-weight: 600; }
`;
const Pin = styled.div`
  direction: ltr; font-size: 2.6rem; font-weight: 800; letter-spacing: 0.08em;
  color: ${theme.game.gold}; font-variant-numeric: tabular-nums;
`;
const Danger = styled(GhostButton)`border-color: ${theme.game.wrong}; color: ${theme.game.ink};`;

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <GhostButton type="button" onClick={() => {
      void navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1800); });
    }}>{done ? HE.PLAY_COPIED : HE.PLAY_COPY_LINK}</GhostButton>
  );
}

interface Props {
  sheet: HostSheet;
  code: string;
  hostKey: string;
  roster: PlayRosterEntry[];
  total: number;
  seconds: number;
  onClose: () => void;
  onKick: (id: string) => void;
  onAskKick: (id: string, name: string) => void;
  onEnd: () => void;
}

export default function HostSheets({ sheet, code, hostKey, roster, total, seconds, onClose, onKick, onAskKick, onEnd }: Props) {
  const origin = window.location.origin;
  if (sheet.kind === 'invite') {
    return (
      <PlaySheet title={HE.PLAY_INVITE_TITLE} onClose={onClose}>
        <Col>
          <Pin>{code.slice(0, 3)} {code.slice(3)}</Pin>
          <QrCode value={joinUrl(code)} size={200} label={HE.PLAY_ARIA_QR} />
          <InviteActions code={code} total={total} seconds={seconds} />
        </Col>
      </PlaySheet>
    );
  }
  if (sheet.kind === 'remote') {
    const url = `${origin}/play/host/${code}#k=${hostKey}`;
    return (
      <PlaySheet title={HE.PLAY_REMOTE_TITLE} onClose={onClose}>
        <Col>
          <Sub>{HE.PLAY_REMOTE_DESC}</Sub>
          <QrCode value={url} size={220} label={HE.PLAY_ARIA_REMOTE_QR} />
          <CopyButton text={url} />
        </Col>
      </PlaySheet>
    );
  }
  if (sheet.kind === 'screen') {
    const url = `${origin}/play/screen/${code}`;
    return (
      <PlaySheet title={HE.PLAY_OPEN_SCREEN} onClose={onClose}>
        <Col>
          <Sub>{HE.PLAY_OPEN_SCREEN_DESC}</Sub>
          <Link>{url}</Link>
          <Row>
            <GoldButton type="button" onClick={() => { window.open(url, '_blank', 'noopener'); onClose(); }}>{HE.PLAY_OPEN_SCREEN}</GoldButton>
            <CopyButton text={url} />
          </Row>
        </Col>
      </PlaySheet>
    );
  }
  if (sheet.kind === 'players') {
    return (
      <PlaySheet title={`${HE.PLAY_PLAYERS_SHEET} · ${roster.length}`} onClose={onClose}>
        {roster.length === 0 ? <Sub>{HE.PLAY_NO_PLAYERS_YET}</Sub> : (
          <List>
            {[...roster].sort((a, b) => b.score - a.score).map(p => (
              <li key={p.id}>
                <span aria-hidden>{p.avatar}</span><span>{p.name}</span>
                <span>{p.score.toLocaleString('he-IL')}</span>
                <Danger type="button" onClick={() => onAskKick(p.id, p.name)}>{HE.PLAY_KICK}</Danger>
              </li>
            ))}
          </List>
        )}
      </PlaySheet>
    );
  }
  const isEnd = sheet.kind === 'end';
  return (
    <PlaySheet title={isEnd ? HE.PLAY_END : HE.PLAY_KICK} onClose={onClose}>
      <Col>
        <Sub>{isEnd ? HE.PLAY_END_CONFIRM : HE.PLAY_KICK_CONFIRM(sheet.name)}</Sub>
        <Row>
          <Danger type="button" onClick={() => { if (isEnd) onEnd(); else onKick(sheet.id); onClose(); }}>
            {isEnd ? HE.PLAY_CONFIRM_YES : HE.PLAY_KICK}
          </Danger>
          <GhostButton type="button" onClick={onClose}>{HE.PLAY_CANCEL}</GhostButton>
        </Row>
      </Col>
    </PlaySheet>
  );
}
