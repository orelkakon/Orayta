/** חלוקת תהילים — shared Tehillim readings. */

export type TehillimMode = 'chapter' | 'day' | 'book';
export type TehillimPurpose = 'refua' | 'neshama' | 'hatzlacha' | 'zivug' | 'banim' | 'yeshua' | 'shmira' | 'other';

export interface TehillimCreateInput {
  purpose: TehillimPurpose;
  names: string[];
  title?: string;
  note?: string;
  mode: TehillimMode;
  goal: number;
  /** ISO date; the reading closes at its end (Israel time). */
  endsAt?: string | null;
}

/** A unit's state in the round shown on the map. */
export type TehillimCell = 'free' | 'held' | 'done';

export interface TehillimActivity { unit: number; round: number; at: string; name: string | null }

export interface TehillimStats {
  /** Units read in all rounds. */
  readUnits: number;
  /** Whole chapters read (119's letters count once, when its first letter is read). */
  chapters: number;
  readers: number;
  /** Holding a unit right now. */
  live: number;
  today: number;
  /** Units read per hour, last 24 hours (oldest first). */
  hourly: number[];
  /** Units read per day, last 14 days (oldest first). */
  daily: number[];
  recent: TehillimActivity[];
  /** Reader names given, most units first. */
  named: { name: string; count: number }[];
}

export interface TehillimMyClaim { id: string; round: number; unit: number; heldUntil: string }

export interface TehillimState {
  slug: string;
  purpose: TehillimPurpose;
  names: string[];
  title: string | null;
  note: string | null;
  mode: TehillimMode;
  goal: number;
  endsAt: string | null;
  closed: boolean;
  createdAt: string;
  /** Completed rounds (whole books). */
  books: number;
  /** The round on the map (the lowest one still open). */
  round: number;
  units: number;
  cells: TehillimCell[];
  stats: TehillimStats;
  /** The asker's own hold and how many units this device read here. */
  me: { claim: TehillimMyClaim | null; read: number } | null;
  /** Present when the request carries the organizer's key. */
  manage: boolean;
}

export type TehillimError =
  | 'bad_request' | 'not_found' | 'closed' | 'rate_limited' | 'taken' | 'too_soon' | 'forbidden' | 'unavailable';

export interface TehillimAdminStats {
  total: number;
  opened30: number;
  active7: number;
  books: number;
  /** Units read in the last 24 hours / 7 days / 30 days. */
  readToday: number;
  readWeek: number;
  readMonth: number;
  readers30: number;
}
