import { tidyInline, tidySikumText } from './typography';

/**
 * A summary as the API stores it (pure, tested): text required, typography
 * applied to every field, dates valid (a range end before its start is dropped).
 */
export interface EntryInput { title: string | null; text: string; date: Date; dateEnd: Date | null; location: string | null }

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const validDate = (v: unknown) => {
  const d = new Date(str(v));
  return Number.isNaN(d.getTime()) ? null : d;
};

export function parseEntryInput(body: unknown): EntryInput | null {
  const b = (body ?? {}) as Record<string, unknown>;
  const text = tidySikumText(str(b.text));
  if (!text) return null;
  const date = validDate(b.date) ?? new Date();
  const end = b.dateEnd ? validDate(b.dateEnd) : null;
  return {
    title: tidyInline(str(b.title)) || null,
    text,
    date,
    dateEnd: end && end.getTime() > date.getTime() ? end : null,
    location: tidyInline(str(b.location)) || null,
  };
}
