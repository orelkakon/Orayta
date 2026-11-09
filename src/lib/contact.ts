/* Contact form rules shared by the page and /api/contact (pure, tested). */
import { HE } from '@/lib/hebrewTexts';

export const CONTACT_TOPICS = ['idea', 'mistake', 'question', 'feedback', 'other'] as const;
export type ContactTopic = typeof CONTACT_TOPICS[number];

export const CONTACT_LIMITS = { name: 60, replyTo: 100, message: 2000 } as const;

export interface ContactInput {
  name?: string;
  replyTo?: string;
  message: string;
  rating?: number;
  topic?: ContactTopic;
}

// Bidi overrides and control characters (keeps \n and \t).
// eslint-disable-next-line no-control-regex
const UNSAFE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g;

const clean = (v: unknown, max: number): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const s = v.replace(UNSAFE, '').trim();
  return s ? s.slice(0, max) : undefined;
};

/** Validates a raw request body; null = nothing to send. */
export function parseContact(raw: unknown): ContactInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.message !== 'string') return null;
  const message = b.message.replace(UNSAFE, '').trim();
  if (!message || message.length > CONTACT_LIMITS.message) return null;
  const rating = typeof b.rating === 'number' && Number.isInteger(b.rating) && b.rating >= 1 && b.rating <= 5
    ? b.rating : undefined;
  const topic = CONTACT_TOPICS.find(t => t === b.topic);
  return {
    message,
    name: clean(b.name, CONTACT_LIMITS.name),
    replyTo: clean(b.replyTo, CONTACT_LIMITS.replyTo),
    rating,
    topic,
  };
}

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

/** The reply address as an email the admin can answer with one click, if it is one. */
export function replyEmail(replyTo: string | undefined): string | undefined {
  return replyTo && EMAIL_RE.test(replyTo) ? replyTo : undefined;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** wa.me only takes digits in international format. */
export function waPhone(raw: string | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

export function waLink(phone: string, text?: string): string {
  return `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** The WhatsApp draft, written from the sender's side. */
export function contactWaText(c: Pick<ContactInput, 'name' | 'message' | 'rating' | 'topic'>): string {
  return [
    HE.CONTACT_WA_INTRO(c.name),
    HE.CONTACT_WA_VIA,
    c.topic ? HE.CONTACT_WA_TOPIC(HE.CONTACT_TOPICS[c.topic]) : '',
    '',
    c.message.trim(),
    c.rating ? `\n${HE.CONTACT_WA_RATING(c.rating)}` : '',
  ].filter((l, i) => l !== '' || i === 3).join('\n');
}
