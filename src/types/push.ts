import type { PushKind } from '@/lib/push/schedule';

/** What the service worker receives in a push event (JSON). */
export interface PushPayload {
  kind: PushKind | 'test' | 'broadcast';
  title: string;
  body: string;
  /** Same-origin path opened on tap. */
  url: string;
  tag: string;
}

/** A message the admin broadcast to every subscriber (kept for the admin card). */
export interface PushBroadcastRecord {
  at: string;
  title: string;
  body: string;
  url: string;
  sent: number;
  failed: number;
}

/** User-editable notification preferences. */
export interface PushPrefs {
  dailyMinutes: number;
  daily: boolean;
  hilula: boolean;
  omer: boolean;
}

/** Browser PushSubscription.toJSON() shape we accept. */
export interface PushSubscriptionJSONBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Local mirror kept in localStorage under `orayta_push`. */
export interface PushLocalState extends PushPrefs {
  enabled: boolean;
  endpoint: string | null;
}

export interface HilulaRabbi {
  id: string;
  name: string;
  fullName: string | null;
  datePeriod: string;
  bio: string;
  imageUrl: string | null;
  deathDate: string | null;
}

export interface HilulaDay {
  /** 'YYYY-MM-DD' (Israel). */
  iso: string;
  /** Hebrew date label, e.g. "י״א בחשון". */
  hebrew: string;
  rabbis: HilulaRabbi[];
}

export interface HilulaResponse {
  today: HilulaDay;
  upcoming: HilulaDay[];
  candles: number;
}

export interface PushAdminStats {
  total: number;
  daily: number;
  hilula: number;
  omer: number;
  /** Daily reminders already sent today (Israel day). */
  sentToday: number;
  failing: number;
}
