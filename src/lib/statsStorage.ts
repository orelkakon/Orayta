const KEY = 'orayta_stats';

export interface StatEntry {
  score: number;
  answeredAt: string;
  content: string;
  mode: 'classic' | 'multiple' | 'completion' | 'rabbi' | 'gematria' | 'books' | 'who_first' | 'seder' | 'bio' | 'image';
}

export interface StatsSummary {
  total: number;
  accuracy: number;
  totalScore: number;
  recent: StatEntry[];
}

export function addStat(entry: Omit<StatEntry, 'answeredAt'>): void {
  if (typeof window === 'undefined') return;
  const all = getStats();
  all.unshift({ ...entry, answeredAt: new Date().toISOString() });
  if (all.length > 300) all.splice(300);
  localStorage.setItem(KEY, JSON.stringify(all));
  void fetch('/api/quiz/answered', { method: 'POST' });
}

function isValidEntry(e: unknown): e is StatEntry {
  if (typeof e !== 'object' || e === null) return false;
  const entry = e as Record<string, unknown>;
  return (
    typeof entry.score === 'number' && isFinite(entry.score) &&
    typeof entry.content === 'string' &&
    typeof entry.mode === 'string' &&
    typeof entry.answeredAt === 'string'
  );
}

export function getStats(): StatEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown[];
    return Array.isArray(raw) ? raw.filter(isValidEntry) : [];
  } catch {
    return [];
  }
}

export function clearStats(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

export function computeSummary(stats: StatEntry[]): StatsSummary {
  if (stats.length === 0) return { total: 0, accuracy: 0, totalScore: 0, recent: [] };
  const totalScore = stats.reduce((s, e) => s + e.score, 0);
  return {
    total: stats.length,
    totalScore,
    accuracy: Math.round((totalScore / stats.length) * 100),
    recent: stats.slice(0, 5),
  };
}
