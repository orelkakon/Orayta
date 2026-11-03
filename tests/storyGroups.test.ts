import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupStories, locate, openIndex, groupSeen } from '@/lib/storyGroups';
import type { DailyStory, StoryKey } from '@/types';

const s = (key: StoryKey) => ({ key, data: {} }) as unknown as DailyStory;

test('groups follow the group order, then the in-group key order', () => {
  const { groups, flat } = groupStories([s('rabbi'), s('daf'), s('quiz'), s('citation'), s('video'), s('parasha')]);
  assert.deepEqual(groups.map(g => g.id), ['learn', 'rabbis', 'play', 'watch']);
  assert.deepEqual(flat.map(x => x.key), ['daf', 'parasha', 'citation', 'rabbi', 'quiz', 'video']);
  assert.deepEqual(groups.map(g => g.start), [0, 3, 4, 5]);
});

test('empty groups are dropped', () => {
  const { groups } = groupStories([s('chidush')]);
  assert.deepEqual(groups.map(g => g.id), ['chidush']);
  assert.equal(groups[0].start, 0);
});

test('locate maps a flat index to its group and position', () => {
  const { groups } = groupStories([s('daf'), s('parasha'), s('rabbi'), s('tale')]);
  assert.deepEqual([locate(groups, 0).group.id, locate(groups, 0).inGroup], ['learn', 0]);
  assert.deepEqual([locate(groups, 1).group.id, locate(groups, 1).inGroup], ['learn', 1]);
  assert.deepEqual([locate(groups, 3).group.id, locate(groups, 3).inGroup], ['rabbis', 1]);
});

test('opening a group resumes at its first unseen story', () => {
  const { groups } = groupStories([s('daf'), s('parasha'), s('halacha'), s('rabbi')]);
  const learn = groups[0];
  assert.equal(openIndex(learn, new Set()), 0);
  assert.equal(openIndex(learn, new Set<StoryKey>(['daf'])), 1);
  assert.equal(openIndex(learn, new Set<StoryKey>(['daf', 'parasha', 'halacha'])), 0);
  assert.equal(groupSeen(learn, new Set<StoryKey>(['daf', 'parasha', 'halacha'])), true);
  assert.equal(groupSeen(learn, new Set<StoryKey>(['daf'])), false);
});
