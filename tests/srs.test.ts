import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  scheduleCard, recordReview, dueIds, buildQueue, summarize, parseState,
  gradeFromScore, daysUntil, nextStep, startOfDay, NEW_PER_DAY, MAX_BOX,
} from '@/lib/srs';
import type { SrsState } from '@/types/quizModes';

const NOW = new Date(2026, 9, 21, 10, 30).getTime();
const days = (n: number) => { const d = new Date(startOfDay(NOW)); d.setDate(d.getDate() + n); return d.getTime(); };

test('good climbs the boxes and schedules at local midnight', () => {
  const c1 = scheduleCard(undefined, 'good', NOW);
  assert.equal(c1.box, 1);
  assert.equal(c1.due, days(1));
  const c2 = scheduleCard(c1, 'good', NOW);
  assert.equal(c2.box, 2);
  assert.equal(c2.due, days(3));
  assert.equal(c2.seen, 2);
  assert.equal(c2.added, c1.added);
});

test('again resets to box 0, due now, and counts a lapse only for learned cards', () => {
  const fresh = scheduleCard(undefined, 'again', NOW);
  assert.equal(fresh.box, 0);
  assert.equal(fresh.due, NOW);
  assert.equal(fresh.lapses, 0);
  const learned = { box: 3, due: NOW, seen: 3, lapses: 0, last: 0, added: 0 };
  assert.equal(scheduleCard(learned, 'again', NOW).lapses, 1);
});

test('hard keeps the box (at least 1) with a shorter wait', () => {
  assert.deepEqual(nextStep(undefined, 'hard'), { box: 1, days: 1 });
  assert.deepEqual(nextStep({ box: 4, due: 0, seen: 1, lapses: 0, last: 0, added: 0 }, 'hard'), { box: 4, days: 7 });
});

test('the top box is capped', () => {
  const top = { box: MAX_BOX, due: 0, seen: 9, lapses: 0, last: 0, added: 0 };
  assert.equal(scheduleCard(top, 'good', NOW).box, MAX_BOX);
});

test('due cards come first, most overdue first, then capped new cards', () => {
  let s: SrsState = {};
  s = { ...s, a: { box: 2, due: NOW - 1000, seen: 1, lapses: 0, last: 0, added: 0 } };
  s = { ...s, b: { box: 2, due: NOW - 5000, seen: 1, lapses: 0, last: 0, added: 0 } };
  s = { ...s, c: { box: 2, due: NOW + 5000, seen: 1, lapses: 0, last: 0, added: 0 } };
  assert.deepEqual(dueIds(s, NOW), ['b', 'a']);
  const all = ['a', 'b', 'c', ...Array.from({ length: 20 }, (_, i) => `n${i}`)];
  const q = buildQueue(s, all, NOW);
  assert.deepEqual(q.slice(0, 2), ['b', 'a']);
  assert.equal(q.length, 2 + NEW_PER_DAY);
  assert.ok(!q.includes('c'));
});

test('cards introduced today use up the new-card allowance', () => {
  let s: SrsState = {};
  for (let i = 0; i < 4; i++) s = recordReview(s, `x${i}`, 'good', NOW);
  const q = buildQueue(s, Array.from({ length: 30 }, (_, i) => `n${i}`), NOW);
  assert.equal(q.length, NEW_PER_DAY - 4);
  assert.equal(buildQueue(s, ['n1', 'n2'], NOW, 5).length, 2);
});

test('summary counts due, learning, mastered and the next due time', () => {
  const s: SrsState = {
    a: { box: 1, due: NOW - 1, seen: 1, lapses: 0, last: 0, added: 0 },
    b: { box: 5, due: days(20), seen: 5, lapses: 0, last: 0, added: 0 },
    c: { box: 2, due: days(2), seen: 2, lapses: 0, last: 0, added: 0 },
  };
  const sum = summarize(s, NOW);
  assert.equal(sum.due, 1);
  assert.equal(sum.learning, 2);
  assert.equal(sum.mastered, 1);
  assert.equal(sum.nextDue, days(2));
  assert.equal(summarize(s, NOW, ['b']).learning, 0);
});

test('corrupt storage degrades to an empty or partial state', () => {
  assert.deepEqual(parseState(null), {});
  assert.deepEqual(parseState([1, 2]), {});
  const good = { box: 1, due: 1, seen: 1, lapses: 0, last: 1, added: 1 };
  assert.deepEqual(parseState({ ok: good, bad: { box: 'x' }, worse: { ...good, box: 99 } }), { ok: good });
});

test('score mapping and day distance', () => {
  assert.equal(gradeFromScore(1), 'good');
  assert.equal(gradeFromScore(0.5), 'hard');
  assert.equal(gradeFromScore(0), 'again');
  assert.equal(daysUntil(days(3), NOW), 3);
  assert.equal(daysUntil(NOW - 1, NOW), 0);
});
