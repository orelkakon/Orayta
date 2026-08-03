import type { Citation, Rabbi, Chidush, FeedSikumData, FeedGematriaData } from './index';

/* ── Daily stories (homepage Stories row) ─────────────────────────────── */

export type StoryKey =
  | 'rabbi' | 'citation' | 'reel' | 'parasha' | 'halacha'
  | 'sikum' | 'chidush' | 'tale' | 'gematria' | 'daf';

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

export type DailyStory =
  | { key: 'rabbi'; data: Rabbi }
  | { key: 'citation'; data: Citation }
  | { key: 'reel'; data: StoryReel }
  | { key: 'parasha'; data: StoryParasha }
  | { key: 'halacha'; data: StoryHalacha }
  | { key: 'sikum'; data: FeedSikumData }
  | { key: 'chidush'; data: Chidush }
  | { key: 'tale'; data: StoryTale }
  | { key: 'gematria'; data: FeedGematriaData }
  | { key: 'daf'; data: StoryDaf };

/** Response of GET /api/stories/daily — same content for every user on a given date. */
export interface DailyStoriesPayload {
  date: string; // YYYY-MM-DD in Asia/Jerusalem
  stories: DailyStory[];
}
