/** Every practice mode on /quiz. */
export type QuizMode =
  | 'review' | 'classic' | 'multiple' | 'completion' | 'chrono' | 'knowledge'
  | 'rabbi' | 'gematria' | 'books' | 'whoFirst' | 'seder' | 'bio' | 'image';

/** Self-grade on a smart-review flashcard. */
export type SrsGrade = 'again' | 'hard' | 'good';

/** One citation's place in the spaced-repetition schedule. */
export interface SrsCard {
  /** Leitner box: 0 = (re)learning, 6 = longest interval. */
  box: number;
  /** Epoch ms when the card is next due. */
  due: number;
  /** Times reviewed. */
  seen: number;
  /** Times forgotten after having been learned. */
  lapses: number;
  /** Epoch ms of the last review. */
  last: number;
  /** Epoch ms of the first review — drives the daily new-card cap. */
  added: number;
}

export type SrsState = Record<string, SrsCard>;

export interface SrsSummary {
  due: number;
  learning: number;
  mastered: number;
  newToday: number;
  /** Earliest future due time, or null when nothing is scheduled. */
  nextDue: number | null;
}

export type KnowledgeKind = 'era' | 'yahrzeit' | 'relation' | 'contemporary' | 'fact';

export interface KnowledgeQuestion {
  id: string;
  kind: KnowledgeKind;
  prompt: string;
  options: string[];
  /** Index into options. */
  answer: number;
  /** Name of the rabbi the explanation card shows. */
  about: string;
}
