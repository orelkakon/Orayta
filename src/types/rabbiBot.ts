/** רבי־בוט — halachic questions answered only from verified source quotes. */

export type RabbiBotTopic =
  | 'shabbat' | 'tefila' | 'brachot' | 'kashrut' | 'moadim'
  | 'family' | 'avelut' | 'mitzvot' | 'bein_adam' | 'other';

/** Main ruling (Sephardi default: Maran + Sephardi poskim), the Ashkenazi view, or a side note. */
export type RabbiBotView = 'main' | 'ashkenaz' | 'note';

/** One retrieved source passage, numbered S1…Sn for the model. */
export interface RabbiBotPassage {
  id: string;
  ref: string;
  heRef: string;
  book: string;
  text: string;
  url: string;
  origin: 'sefaria' | 'wikisource';
}

export interface RabbiBotCite {
  /** Index into RabbiBotAnswer.sources. */
  source: number;
  /** Verbatim words of the source (taken from the source text, never from the model). */
  quote: string;
}

export interface RabbiBotPoint {
  text: string;
  view: RabbiBotView;
  cites: RabbiBotCite[];
}

export interface RabbiBotSource {
  heRef: string;
  book: string;
  url: string;
  text: string;
  origin: RabbiBotPassage['origin'];
}

export type RabbiBotStatus = 'answered' | 'not_found' | 'sensitive' | 'other';

export interface RabbiBotAnswer {
  status: RabbiBotStatus;
  short: string;
  points: RabbiBotPoint[];
  sources: RabbiBotSource[];
  dispute: boolean;
  topic: RabbiBotTopic;
  /** Points the model wrote vs. points whose quotes were found in the sources. */
  total: number;
  verified: number;
}

export type RabbiBotStep = 'plan' | 'search' | 'read' | 'answer' | 'verify';

/** NDJSON lines streamed by POST /api/rabbi-bot/ask. */
export type RabbiBotEvent =
  | { type: 'step'; step: RabbiBotStep; count?: number }
  | { type: 'done'; id: string; token: string; answer: RabbiBotAnswer }
  | { type: 'error'; error: RabbiBotError; resetAt?: string };

export type RabbiBotError =
  | 'bad_request' | 'too_short' | 'too_long' | 'link'
  | 'rate_limited' | 'quota' | 'busy' | 'unavailable';

export interface RabbiBotFeedback {
  id: string;
  token: string;
  rating?: number;
  report?: boolean;
  note?: string;
}

export interface RabbiBotAdminRow {
  id: string;
  createdAt: string;
  question: string | null;
  status: RabbiBotStatus;
  topic: string | null;
  rating: number | null;
  reported: boolean;
  note: string | null;
  verified: number;
  points: number;
}

export interface RabbiBotAdminStats {
  total: number;
  today: number;
  yesterday: number;
  week: number;
  prevWeek: number;
  askers10d: number;
  ratingAvg: number | null;
  ratingCount: number;
  ratingDist: number[];
  answeredPct: number;
  verifiedPct: number;
  avgLatencyMs: number;
  cachedPct: number;
  reports: number;
  byStatus: Partial<Record<RabbiBotStatus, number>>;
  byTopic: { topic: string; count: number }[];
  topBooks: { book: string; count: number }[];
  models: string[];
  modelsToday: { model: string; count: number }[];
  exhaustedToday: string[];
  lowRated: RabbiBotAdminRow[];
  recent: RabbiBotAdminRow[];
}
