// Group quiz (חידון קבוצתי) — shared between the API and the /play screens.

export type PlayStatus = 'lobby' | 'question' | 'reveal' | 'board' | 'ended';

export type PlayTopic = 'talmud' | 'rabbis' | 'gematria';

export type PlayQuestionKind =
  | 'masechet' | 'complete' | 'era' | 'whoFirst' | 'bio' | 'book' | 'gematria';

/** A frozen question as stored in GameSession.questions. */
export interface PlayQuestion {
  kind: PlayQuestionKind;
  prompt: string;
  /** Optional second line under the prompt (e.g. the citation body). */
  body?: string;
  options: string[];
  correct: number;
  /** Shown on reveal — the source or a short explanation. */
  explain?: string;
  /** Read-only time before the options open, scaled to the prompt length. */
  leadMs: number;
}

export interface PlaySettings {
  topics: PlayTopic[];
  count: number;
  seconds: number;
  seder?: string;
  masechet?: string;
  title?: string;
}

export type PlayCreateRequest = PlaySettings;

export interface PlayCreateResponse {
  code: string;
  hostKey: string;
}

export interface PlayJoinResponse {
  playerId: string;
  key: string;
  name: string;
  avatar: string;
}

export interface PlayRosterEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

export interface PlayBoardEntry extends PlayRosterEntry {
  rank: number;
  prevRank: number;
  delta: number;
}

/** The current question as clients see it — `correct` only after reveal. */
export interface PlayPublicQuestion {
  index: number;
  kind: PlayQuestionKind;
  prompt: string;
  body?: string;
  options: string[];
  /** When the question appeared (the read-only lead starts here). */
  shownAt: number;
  opensAt: number;
  endsAt: number;
}

export interface PlayReveal {
  correct: number;
  counts: number[];
  explain?: string;
}

export interface PlayMe {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  streak: number;
  kicked: boolean;
  answered: boolean;
  choice: number | null;
  /** Only filled once the question is revealed. */
  correct: boolean | null;
  points: number | null;
  /** Points missing to the player one rank above (null when first). */
  gapUp: number | null;
}

export interface PlayState {
  code: string;
  status: PlayStatus;
  version: number;
  serverNow: number;
  total: number;
  current: number;
  settings: PlaySettings;
  playerCount: number;
  answeredCount: number;
  roster: PlayRosterEntry[];
  question: PlayPublicQuestion | null;
  reveal: PlayReveal | null;
  board: PlayBoardEntry[];
  me: PlayMe | null;
  isHost: boolean;
}

export type PlayHostAction =
  | { action: 'start' }
  | { action: 'reveal' }
  | { action: 'board' }
  | { action: 'next' }
  | { action: 'end' }
  | { action: 'kick'; playerId: string };

export type PlayErrorCode =
  | 'not_found' | 'ended' | 'name_taken' | 'name_invalid' | 'full'
  | 'rate_limited' | 'unauthorized' | 'bad_request' | 'closed' | 'already' | 'not_enough';
