import { SikumEntry } from '@/types';

/**
 * Unsaved summary text, per device. A new summary keeps a draft per book;
 * editing keeps one per entry, so a long edit survives the app being closed
 * (iOS drops home-screen apps in the background). An edit draft is only
 * offered while it is newer than the entry itself.
 */
const DRAFT_TTL = 24 * 60 * 60 * 1000;

export interface DraftData { title: string; text: string; date: string; dateEnd: string; isRange: boolean; location: string; at: number; }
export type DraftFields = Omit<DraftData, 'at'>;

export const draftScope = (bookId: string, entry?: SikumEntry) => entry ? `edit_${entry.id}` : bookId;
const draftKey = (scope: string) => `orayta_sikum_draft_${scope}`;

export function loadDraft(scope: string, entry?: SikumEntry): DraftData | null {
  try {
    const raw = localStorage.getItem(draftKey(scope));
    if (!raw) return null;
    const d = JSON.parse(raw) as DraftData;
    const stale = Date.now() - d.at > DRAFT_TTL || (!!entry && d.at <= Date.parse(entry.updatedAt));
    if (stale) { localStorage.removeItem(draftKey(scope)); return null; }
    return d;
  } catch { return null; }
}

export function saveDraft(scope: string, data: DraftFields) {
  try { localStorage.setItem(draftKey(scope), JSON.stringify({ ...data, at: Date.now() })); } catch {}
}

export function clearDraft(scope: string) {
  try { localStorage.removeItem(draftKey(scope)); } catch {}
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
