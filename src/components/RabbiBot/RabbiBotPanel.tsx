'use client';

import { useEffect, useRef, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { QuietBtn, ErrorLine } from '@/components/Notifications/sheetStyles';
import { LineIcon } from '@/components/common/LineIcons';
import { useRabbiBot } from './useRabbiBot';
import WelcomeCard from './WelcomeCard';
import Composer from './Composer';
import ThinkingStage from './ThinkingStage';
import StreamingAnswer from './StreamingAnswer';
import SpokenAnswer from './voice/SpokenAnswer';
import Feedback from './Feedback';
import ShareAnswer from './ShareAnswer';
import RecentQuestions from './RecentQuestions';
import ThreadTurns from './ThreadTurns';
import FollowUpBox from './FollowUpBox';
import { canFollowUp, fullQuestion } from '@/lib/rabbiBot/client';
import RabbiBotAvatar from './RabbiBotAvatar';
import { Card, Greeting, Question, Stack } from './styles';
import { useSharedQuestion } from './useSharedQuestion';

function quotaTime(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

interface Props {
  idPrefix: string;
  /** A question from a shared link (/ask?q=): asked once on arrival, or reopened if this device has it. */
  sharedQuestion?: string | null;
}

/** The whole רבי־בוט flow; hosted by the floating sheet and by /ask. */
export default function RabbiBotPanel({ idPrefix, sharedQuestion }: Props) {
  const { state, loaded, acceptWelcome, ask, followUp, reset, reopen, clearHistory, feedback } = useRabbiBot();
  useSharedQuestion(sharedQuestion, loaded && state.welcomed, state.history, ask, reopen);
  // A spoken question gets its answer read aloud when it arrives.
  const [spokenAsk, setSpokenAsk] = useState<string | null>(null);
  // A follow-up starts below the thread: bring its question into view.
  const questionRef = useRef<HTMLDivElement>(null);
  const followingUp = state.phase === 'asking' && state.followUp !== null;
  useEffect(() => {
    if (followingUp) questionRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [followingUp]);

  if (!state.welcomed) return <WelcomeCard onAccept={acceptWelcome} />;

  const asking = state.phase === 'asking';
  const showComposer = state.phase === 'idle' || state.phase === 'error';

  return (
    <Stack>
      {state.phase === 'idle' && <Greeting><RabbiBotAvatar size={44} mood="happy" /><p>{HE.RB_GREETING}</p></Greeting>}
      {state.phase !== 'idle' && <ThreadTurns turns={state.thread} />}
      {state.phase !== 'idle' && state.question && <Question ref={questionRef}>{state.question}</Question>}

      {asking && (state.partial
        ? <StreamingAnswer answer={state.partial} idPrefix={idPrefix} />
        : <ThinkingStage steps={state.steps} />)}

      {state.phase === 'done' && state.last && (
        <>
          <SpokenAnswer answer={state.last.answer} idPrefix={idPrefix} autoPlay={spokenAsk === state.last.question} />
          {state.last.answer.status === 'answered' && <ShareAnswer question={fullQuestion(state.last)} answer={state.last.answer} />}
          <Feedback rating={state.last.rating} reported={state.last.reported} onFeedback={feedback} />
          {canFollowUp(state.last) && (
            <FollowUpBox key={state.last.id || state.last.question} onAsk={(q, website, voice) => { setSpokenAsk(voice ? q : null); followUp(q, website); }} />
          )}
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
          followUp={state.phase === 'error' && !!state.followUp}
          onAsk={(q, website, voice) => { setSpokenAsk(voice ? q : null); void ask(q, website, state.phase === 'error' ? state.followUp : null); }}
        />
      )}
      {state.phase === 'error' && state.followUp && (
        <QuietBtn type="button" onClick={reset}><LineIcon name="ask" size={18} /> {HE.RB_NEW_QUESTION}</QuietBtn>
      )}

      {state.phase === 'idle' && <RecentQuestions items={state.history} onOpen={reopen} onClear={clearHistory} />}
    </Stack>
  );
}
