'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { InstagramPage } from '@/types';
import type { BackfillSummary, StopReason } from '@/lib/igBackfill';
import { useBackfill, BackfillState } from './useBackfill';
import { Row, RowText, Muted, Actions, SmallBtn, DelBtn } from './adminStyles';

const Item = styled.div`display: flex; flex-direction: column; gap: 4px;`;

const BackfillBtn = styled(SmallBtn)`
  color: ${theme.colors.primary}; border-color: ${theme.colors.secondary};
  &:disabled { opacity: 0.55; }
`;

const Panel = styled.div<{ $tone: 'info' | 'ok' | 'error' }>`
  font-size: 0.8rem; line-height: 1.5; color: ${theme.colors.text};
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border-radius: ${theme.radii.sm};
  background: ${p => p.$tone === 'error' ? theme.colors.bgError : p.$tone === 'ok' ? theme.colors.bgSuccess : theme.colors.bgWarning};
  display: flex; flex-direction: column; gap: 2px;
`;

const PanelHead = styled.div`display: flex; justify-content: space-between; gap: ${theme.spacing.sm}; font-weight: 700;`;

const Dismiss = styled.button`font-size: 0.75rem; color: ${theme.colors.textMuted};`;

const sourceLabel = (s?: BackfillSummary['source']) =>
  s === 'graph' ? HE.IG_BF_SOURCE_GRAPH : HE.IG_BF_SOURCE_EMBED;

function stopText(reason: StopReason, source: BackfillSummary['source']): string {
  switch (reason) {
    case 'reached-existing': return HE.IG_BF_STOP_EXISTING;
    case 'limit':            return HE.IG_BF_STOP_LIMIT;
    case 'source-exhausted': return source === 'embed' ? HE.IG_BF_STOP_EXHAUSTED_EMBED : HE.IG_BF_STOP_EXHAUSTED;
    case 'scan-cap':         return HE.IG_BF_STOP_SCAN_CAP;
    case 'time-budget':      return HE.IG_BF_STOP_TIME;
    case 'source-error':     return HE.IG_BF_STOP_SOURCE_ERROR;
  }
}

function StatusPanel({ state, onDismiss }: { state: BackfillState; onDismiss: () => void }) {
  if (state.phase === 'idle') return null;
  if (state.phase === 'running') {
    const line = state.status === 'starting' ? HE.IG_BF_STARTING
      : state.status === 'listing' ? HE.IG_BF_LISTING(sourceLabel(state.source))
        : HE.IG_BF_INSPECTING;
    return (
      <Panel $tone="info" role="status" aria-live="polite">
        <PanelHead>{line}</PanelHead>
        <span>{HE.IG_BF_PROGRESS(state.scanned, state.added, state.skipped)}</span>
      </Panel>
    );
  }
  if (state.phase === 'error') {
    const msg = state.busy ? HE.IG_BF_ERROR_BUSY : state.network ? HE.IG_BF_ERROR_NETWORK : state.message;
    return (
      <Panel $tone="error" role="alert">
        <PanelHead>{HE.IG_BF_ERROR}<Dismiss onClick={onDismiss}>{HE.IG_BF_DISMISS}</Dismiss></PanelHead>
        <span dir="auto">{msg}</span>
      </Panel>
    );
  }
  const { summary } = state;
  const sk = summary.skipped;
  const skippedDetail = HE.IG_BF_SKIPPED_DETAIL(sk['too-long'], sk['not-playable'], sk.unverified, sk['not-video']);
  return (
    <Panel $tone={summary.errors.length ? 'error' : 'ok'} role="status" aria-live="polite">
      <PanelHead>{HE.IG_BF_ADDED_N(summary.added.length)}<Dismiss onClick={onDismiss}>{HE.IG_BF_DISMISS}</Dismiss></PanelHead>
      <span>{stopText(summary.stopReason, summary.source)}</span>
      <Muted>{HE.IG_BF_PROGRESS(summary.scanned, summary.added.length, Object.values(sk).reduce((a, b) => a + b, 0))}
        {' · '}{sourceLabel(summary.source)}</Muted>
      {skippedDetail && <Muted>{skippedDetail}</Muted>}
      {summary.errors.map(e => <Muted key={e} dir="auto">{e}</Muted>)}
    </Panel>
  );
}

interface Props {
  page: InstagramPage;
  onToggle: () => void;
  onDelete: () => void;
  onChanged: () => void;
}

export default function PageRow({ page, onToggle, onDelete, onChanged }: Props) {
  const { state, start, reset } = useBackfill(page.id, onChanged);
  const running = state.phase === 'running';

  return (
    <Item>
      <Row $off={!page.active}>
        <RowText>@{page.username} <Muted>({page.reelCount ?? 0})</Muted></RowText>
        <Actions>
          <BackfillBtn onClick={() => void start()} disabled={running} title={HE.IG_BF_BTN_TITLE}>
            {running ? HE.IG_BF_RUNNING : `🔎 ${HE.IG_BF_BTN}`}
          </BackfillBtn>
          <SmallBtn onClick={onToggle}>{page.active ? HE.IG_ADMIN_ACTIVE : HE.IG_ADMIN_INACTIVE}</SmallBtn>
          <DelBtn onClick={onDelete} disabled={running}>✕</DelBtn>
        </Actions>
      </Row>
      <StatusPanel state={state} onDismiss={reset} />
    </Item>
  );
}
