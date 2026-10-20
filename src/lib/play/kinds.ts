import type { PlayLevel, PlayQuestionKind, PlayTopic } from '@/types/play';

/**
 * The catalogue of group-quiz question types, grouped by topic — shared by
 * the host setup screen and the server-side validation/builder.
 */
export const KIND_GROUPS: { topic: PlayTopic; kinds: PlayQuestionKind[] }[] = [
  { topic: 'talmud', kinds: ['masechet', 'daf', 'complete', 'seder'] },
  {
    topic: 'rabbis',
    kinds: ['era', 'century', 'whoFirst', 'whoLast', 'contemporary', 'bio', 'image', 'yahrzeit', 'relation', 'fact', 'book', 'bookOf'],
  },
  { topic: 'gematria', kinds: ['gematria', 'gematriaWord'] },
];

export const ALL_KINDS: PlayQuestionKind[] = KIND_GROUPS.flatMap(g => g.kinds);

export const DEFAULT_KINDS: PlayQuestionKind[] = [
  'masechet', 'complete', 'seder', 'era', 'whoFirst', 'bio', 'image', 'fact', 'book', 'gematria',
];

export const LEVELS: PlayLevel[] = ['easy', 'normal', 'hard'];

export function topicOf(kind: PlayQuestionKind): PlayTopic {
  return KIND_GROUPS.find(g => g.kinds.includes(kind))!.topic;
}

export function isKind(v: unknown): v is PlayQuestionKind {
  return typeof v === 'string' && (ALL_KINDS as string[]).includes(v);
}
