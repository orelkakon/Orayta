import type { FeedCommentTarget } from '@/types';

/**
 * Pure rules for feed comments — shared by the API (authoritative checks)
 * and the composer (instant feedback). No I/O here, so it is unit-tested.
 */
export const COMMENT_TARGETS: readonly FeedCommentTarget[] =
  ['citation', 'rabbi', 'book', 'chidush', 'gematria', 'sikum', 'reel'];

export const COMMENT_NAME_MAX = 30;
export const COMMENT_TEXT_MIN = 2;
export const COMMENT_TEXT_MAX = 500;
export const COMMENTS_PAGE_SIZE = 20;

// Anonymous public comments attract link spam — links are simply not allowed.
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|info|io|ly|me|co|co\.il|org\.il)\b)/i;

export type CommentError = 'empty' | 'too_short' | 'too_long' | 'name_too_long' | 'link';

export type CommentValidation =
  | { ok: true; name: string | null; text: string }
  | { ok: false; error: CommentError };

export function isCommentTarget(t: unknown): t is FeedCommentTarget {
  return typeof t === 'string' && (COMMENT_TARGETS as readonly string[]).includes(t);
}

/** Trim, drop control chars, collapse runs of blank lines / spaces. */
export function normalizeCommentText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeCommentName(raw: string): string {
  return normalizeCommentText(raw).replace(/\s+/g, ' ');
}

export function validateComment(rawName: unknown, rawText: unknown): CommentValidation {
  const text = normalizeCommentText(typeof rawText === 'string' ? rawText : '');
  const name = normalizeCommentName(typeof rawName === 'string' ? rawName : '');
  if (!text) return { ok: false, error: 'empty' };
  if (text.length < COMMENT_TEXT_MIN) return { ok: false, error: 'too_short' };
  if (text.length > COMMENT_TEXT_MAX) return { ok: false, error: 'too_long' };
  if (name.length > COMMENT_NAME_MAX) return { ok: false, error: 'name_too_long' };
  if (LINK_RE.test(text) || LINK_RE.test(name)) return { ok: false, error: 'link' };
  return { ok: true, name: name || null, text };
}

/** Stable key for one commentable post, e.g. "citation:abc" / "reel:xyz". */
export function commentKey(type: FeedCommentTarget, id: string): string {
  return `${type}:${id}`;
}

export type CommentAge =
  | { unit: 'now' }
  | { unit: 'min' | 'hour' | 'day' | 'week'; n: number }
  | { unit: 'date'; date: Date };

/** Coarse relative age, Instagram-style; formatted to Hebrew by the UI. */
export function commentAge(createdAt: Date, now: Date): CommentAge {
  const mins = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
  if (mins < 1) return { unit: 'now' };
  if (mins < 60) return { unit: 'min', n: mins };
  const hours = Math.floor(mins / 60);
  if (hours < 24) return { unit: 'hour', n: hours };
  const days = Math.floor(hours / 24);
  if (days < 7) return { unit: 'day', n: days };
  if (days < 35) return { unit: 'week', n: Math.floor(days / 7) };
  return { unit: 'date', date: createdAt };
}

const AVATAR_TINTS = ['232,203,118', '226,168,98', '124,212,156', '148,158,255', '214,150,244', '255,158,84', '120,200,230'];

/** Deterministic avatar tint per display name, so a person keeps one color. */
export function avatarTint(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}
