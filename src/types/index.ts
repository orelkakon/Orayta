export type Amud = 'א' | 'ב';

export interface CitationLocation {
  id: string;
  masechet: string;
  seder: string;
  daf: string;
  amud: Amud | null;
}

export interface Citation {
  id: string;
  content: string;
  locations: CitationLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface MasechetInfo {
  name: string;
  seder: string;
}

export interface QuizQuestion {
  citation: Citation;
}

export interface QuizAnswer {
  citationId: string;
  masechet: string;
  daf: string;
  amud: Amud | null;
}

export interface QuizResult {
  score: number;
  correctLocations: CitationLocation[];
}

export interface QuizStats {
  total: number;
  totalScore: number;
  accuracy: number;
  recentResults: Array<{
    score: number;
    answeredAt: string;
    citationContent: string;
  }>;
}

export type RabbiCategory = 'torah' | 'neviim' | 'shoftim' | 'melachim' | 'ketuvim' | 'zugot' | 'tannaim' | 'amoraim' | 'geonim' | 'rishonim' | 'acharonim' | 'hasidim' | 'abuchatzira' | 'late';

export interface Rabbi {
  id: string;
  name: string;
  fullName: string | null;
  sortYear: number;
  datePeriod: string;
  isAlive: boolean;
  bio: string;
  category: string;
  deathDate: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface CitationFilters {
  masechet?: string;
  seder?: string;
  search?: string;
}

export interface Gematria {
  id: string;
  word: string;
  value: number;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  rabbiId: string | null;
  createdAt: string;
}

export interface Chidush {
  id: string;
  text: string;
  source: string | null;
  author: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Dedication {
  id: string;
  type: string;
  name: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export interface SikumBook {
  id: string;
  name: string;
  author: string | null;
  icon: string | null;
  createdAt: string;
  entryCount: number;
}

export interface SikumEntry {
  id: string;
  bookId: string;
  title: string | null;
  text: string;
  date: string;
  dateEnd: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FeedItemType = 'citation' | 'rabbi' | 'book' | 'chidush' | 'gematria' | 'sikum';
export type FeedReaction = 'heart' | 'fire' | 'spark';

export interface FeedReactions {
  heart: number;
  fire: number;
  spark: number;
}

export interface FeedSikumData {
  id: string;
  title: string | null;
  text: string;
  bookName: string;
  bookIcon: string | null;
  location: string | null;
  date: string;
}

export interface FeedGematriaData extends Gematria {
  matches: string[];
}

export interface FeedItem {
  type: FeedItemType;
  id: string;
  reactions: FeedReactions;
  comments?: number;
  isYahrzeit?: boolean;
  data: Citation | Rabbi | Book | Chidush | FeedGematriaData | FeedSikumData;
}

export interface FeedDedicationSlide {
  slideType: 'dedication';
  id: string;
  dedType: string;
  name: string;
}

export interface InstagramPage {
  id: string;
  username: string;
  url: string;
  active: boolean;
  createdAt: string;
  reelCount?: number;
}

export interface InstagramReel {
  id: string;
  pageId: string | null;
  code: string;
  url: string;
  active: boolean;
  createdAt: string;
  username?: string | null;
  comments?: number;
}

export interface FeedReelSlide {
  slideType: 'reel';
  id: string;
  code: string;
  url: string;
  username: string | null;
  reelId: string;
  comments: number;
}

/** Anything in the feed people can comment on (content items + reels). */
export type FeedCommentTarget = FeedItemType | 'reel';

export interface FeedComment {
  id: string;
  name: string | null;
  text: string;
  createdAt: string;
}

export interface FeedCommentsPage {
  comments: FeedComment[];
  total: number;
  nextCursor: string | null;
}

/** POST /api/feed/comments response — `token` lets the author delete it later. */
export interface FeedCommentCreated {
  comment: FeedComment;
  token: string;
}

/** Which post the comments sheet is open for. */
export interface FeedCommentsTarget {
  type: FeedCommentTarget;
  id: string;
  label: string;
  icon: string;
  accent: string;
}

/** The daily "חתימה" celebration slide — appears once per day at the goal. */
export interface FeedSealSlide {
  slideType: 'seal';
  id: string;
}

export type FeedSlide = FeedItem | FeedDedicationSlide | FeedReelSlide | FeedSealSlide;

/** Every per-day metric stored in DailyStat and shown in the admin panel. */
export type DailyMetric =
  | 'users' | 'feed' | 'content' | 'today' | 'pwa'
  | 'stories' | 'quiz' | 'rabbis' | 'study' | 'sikumim' | 'chidushim' | 'gematria' | 'live';

export interface AdminDailyRow extends Record<DailyMetric, number> {
  day: string;
}

export interface AdminStats {
  visits: number;
  questions: number;
  saves: number;
  shares: { wa: number; story: number };
  reactions: { total: number; heart: number; fire: number; spark: number };
  comments: AdminCommentStats;
  totals: Record<DailyMetric, number>;
  daily: AdminDailyRow[];
}

/** A post as the admin sees it in comment stats: what it is + a short preview. */
export interface AdminCommentPost {
  type: FeedCommentTarget;
  id: string;
  preview: string;
}

export interface AdminCommentStats {
  total: number;
  today: number;
  yesterday: number;
  week: number;
  prevWeek: number;
  /** Distinct devices/IPs that ever commented. */
  commenters: number;
  /** Distinct posts with at least one comment. */
  posts: number;
  byType: Partial<Record<FeedCommentTarget, number>>;
  top: (AdminCommentPost & { count: number })[];
  recent: (FeedComment & { post: AdminCommentPost })[];
}

/* Daily-stories and live-torah types live in sibling files to keep this file
   within reach of the 200-line rule; re-exported so consumers keep importing
   from '@/types'. */
export * from './stories';
export * from './live';
