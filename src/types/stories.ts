import type { Citation, Rabbi, Chidush, FeedSikumData, FeedGematriaData } from './index';

/* ── Daily stories (homepage Stories row) ─────────────────────────────── */

export type StoryKey =
  | 'rabbi' | 'citation' | 'reel' | 'parasha' | 'halacha'
  | 'sikum' | 'quiz' | 'chidush' | 'tale' | 'video' | 'gematria' | 'daf';

export interface StoryHalacha {
  text: string;
  source: string;
}

export interface StoryTale {
  title: string;
  text: string;
  source: string;
}

export interface StoryParasha {
  name: string;
  insight: string;
  url: string; // Sefaria reading for this parasha
}

export interface StoryDaf {
  display: string;
  url: string;
}

export interface StoryReel {
  code: string;
  url: string;
  username: string | null;
}

/** Tap-to-answer daily question: identify the masechet of a citation. */
export interface StoryQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  source: string; // full location, revealed after answering
}

export type DailyStory =
  | { key: 'rabbi'; data: Rabbi }
  | { key: 'citation'; data: Citation }
  | { key: 'reel'; data: StoryReel }
  | { key: 'parasha'; data: StoryParasha }
  | { key: 'halacha'; data: StoryHalacha }
  | { key: 'sikum'; data: FeedSikumData }
  | { key: 'quiz'; data: StoryQuiz }
  | { key: 'chidush'; data: Chidush }
  | { key: 'tale'; data: StoryTale }
  | { key: 'video'; data: StoryReel }
  | { key: 'gematria'; data: FeedGematriaData }
  | { key: 'daf'; data: StoryDaf };

/** Response of GET /api/stories/daily — same content for every user on a given date. */
export interface DailyStoriesPayload {
  date: string; // YYYY-MM-DD in Asia/Jerusalem
  stories: DailyStory[];
}
