'use client';

import { HE } from '@/lib/hebrewTexts';
import { QuietBtn, ErrorLine } from '@/components/Notifications/sheetStyles';
import { LineIcon } from '@/components/common/LineIcons';
import { useRabbiBot } from './useRabbiBot';
import WelcomeCard from './WelcomeCard';
import Composer from './Composer';
import Progress from './Progress';
import AnswerView from './AnswerView';
import Feedback from './Feedback';
import { Card, Chip, ChipRow, Muted, Question, Stack } from './styles';

function quotaTime(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

/** The whole רבי־בוט flow; hosted by the floating sheet and by /ask. */
export default function RabbiBotPanel({ idPrefix }: { idPrefix: string }) {
  const { state, acceptWelcome, ask, reset, feedback } = useRabbiBot();

  if (!state.welcomed) return <WelcomeCard onAccept={acceptWelcome} />;

  const asking = state.phase === 'asking';
  const showComposer = state.phase === 'idle' || state.phase === 'error';

  return (
    <Stack>
      {state.phase !== 'idle' && state.question && <Question>{state.question}</Question>}

      {asking && <Progress steps={state.steps} />}

      {state.phase === 'done' && state.last && (
        <>
          <AnswerView answer={state.last.answer} idPrefix={idPrefix} />
          <Feedback rating={state.last.rating} reported={state.last.reported} onFeedback={feedback} />
          <QuietBtn type="button" onClick={reset}><LineIcon name="ask" size={18} /> {HE.RB_NEW_QUESTION}</QuietBtn>
        </>
      )}

      {state.phase === 'error' && state.error && (
        state.error === 'quota'
          ? <Card>{HE.RB_QUOTA(quotaTime(state.resetAt))}</Card>
          : <ErrorLine role="alert">{HE.RB_ERRORS[state.error]}</ErrorLine>
      )}

      {showComposer && (
        <Composer
          key={state.phase === 'error' ? 'retry' : 'new'}
          disabled={asking || state.error === 'quota'}
          initial={state.phase === 'error' ? state.question : ''}
          onAsk={(q, website) => void ask(q, website)}
        />
      )}

      {state.phase === 'idle' && (
        <Stack>
          <Muted>{HE.RB_EXAMPLES_TITLE}</Muted>
          <ChipRow>
            {HE.RB_EXAMPLES.map(q => <Chip key={q} type="button" onClick={() => void ask(q)}>{q}</Chip>)}
          </ChipRow>
        </Stack>
      )}
    </Stack>
  );
}
