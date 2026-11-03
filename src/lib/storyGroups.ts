import type { DailyStory, StoryKey } from '@/types';

/**
 * The day's stories grouped into a few "channels", Instagram-style: the row
 * shows one circle per group, and the viewer's progress bars cover only the
 * current group (3–5 segments instead of 13). Order follows the groups, then
 * the API's order inside each group. Unknown keys fall into the last group.
 */
export type StoryGroupId = 'learn' | 'rabbis' | 'play' | 'chidush' | 'watch';

export const STORY_GROUP_DEFS: { id: StoryGroupId; keys: StoryKey[] }[] = [
  { id: 'learn', keys: ['daf', 'parasha', 'halacha', 'citation', 'sikum'] },
  { id: 'rabbis', keys: ['rabbi', 'tale', 'rabbiQuiz'] },
  { id: 'play', keys: ['quiz', 'gematria'] },
  { id: 'chidush', keys: ['chidush'] },
  { id: 'watch', keys: ['video', 'reel'] },
];

export interface StoryGroup {
  id: StoryGroupId;
  /** Index of the group's first story in the flattened sequence. */
  start: number;
  stories: DailyStory[];
}

export function groupStories(stories: DailyStory[]): { groups: StoryGroup[]; flat: DailyStory[] } {
  const buckets = new Map<StoryGroupId, DailyStory[]>(STORY_GROUP_DEFS.map(g => [g.id, []]));
  for (const s of stories) {
    const def = STORY_GROUP_DEFS.find(g => g.keys.includes(s.key)) ?? STORY_GROUP_DEFS[STORY_GROUP_DEFS.length - 1];
    buckets.get(def.id)!.push(s);
  }
  const groups: StoryGroup[] = [];
  const flat: DailyStory[] = [];
  for (const def of STORY_GROUP_DEFS) {
    const list = buckets.get(def.id)!;
    if (list.length === 0) continue;
    const order = (k: StoryKey) => def.keys.indexOf(k);
    const sorted = [...list].sort((a, b) => order(a.key) - order(b.key));
    groups.push({ id: def.id, start: flat.length, stories: sorted });
    flat.push(...sorted);
  }
  return { groups, flat };
}

/** The group a flattened index belongs to, and the index inside it. */
export function locate(groups: StoryGroup[], index: number): { group: StoryGroup; inGroup: number } {
  const group = [...groups].reverse().find(g => index >= g.start) ?? groups[0];
  return { group, inGroup: index - group.start };
}

/** Where opening a group starts: its first unseen story, else its first. */
export function openIndex(group: StoryGroup, viewed: Set<StoryKey>): number {
  const i = group.stories.findIndex(s => !viewed.has(s.key));
  return group.start + (i === -1 ? 0 : i);
}

export const groupSeen = (group: StoryGroup, viewed: Set<StoryKey>) =>
  group.stories.every(s => viewed.has(s.key));
