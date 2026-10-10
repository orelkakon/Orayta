import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  gradeTime, summarizeTimes, scheduleStatus, isPlausibleTime, RawReport,
} from '@/lib/minyan/confidence';

const NOW = new Date('2026-10-11T12:00:00Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);
const r = (over: Partial<RawReport>): RawReport => ({
  service: 'mincha', dayType: 'weekday', time: '13:30', kind: 'confirm',
  verified: false, reporter: 'a', createdAt: daysAgo(1), ...over,
});

test('grade: one fresh reporter is medium, three fresh are high', () => {
  assert.equal(gradeTime(1, 2, 0, false), 'medium');
  assert.equal(gradeTime(3, 2, 0, false), 'high');
});

test('grade: one stale reporter is low', () => {
  assert.equal(gradeTime(1, 200, 0, false), 'low');
});

test('grade: disputes pull a time down to disputed', () => {
  assert.equal(gradeTime(1, 5, 1, false), 'disputed');
  assert.equal(gradeTime(3, 5, 1, false), 'medium');
});

test('grade: admin-verified stays verified unless several people dispute it', () => {
  assert.equal(gradeTime(1, 300, 1, true), 'verified');
  assert.notEqual(gradeTime(1, 5, 2, true), 'verified');
});

test('summarize: counts distinct reporters, not repeated votes', () => {
  const [t] = summarizeTimes([r({ reporter: 'a' }), r({ reporter: 'a', createdAt: daysAgo(3) }), r({ reporter: 'b' })], NOW);
  assert.equal(t.reporters, 2);
  assert.equal(t.lastConfirmedAt, daysAgo(1).toISOString());
});

test('summarize: only disputes after the last confirmation count', () => {
  const [t] = summarizeTimes([
    r({ kind: 'dispute', reporter: 'x', createdAt: daysAgo(10) }),
    r({ reporter: 'a', createdAt: daysAgo(5) }),
    r({ kind: 'dispute', reporter: 'y', createdAt: daysAgo(2) }),
  ], NOW);
  assert.equal(t.disputes, 1);
});

test('summarize: dispute-only and year-old groups never produce a time', () => {
  const out = summarizeTimes([
    r({ time: '14:00', kind: 'dispute' }),
    r({ time: '15:00', createdAt: daysAgo(400) }),
  ], NOW);
  assert.deepEqual(out, []);
});

test('summarize: sorted by service then day then time', () => {
  const out = summarizeTimes([
    r({ service: 'maariv', time: '19:00' }),
    r({ service: 'shacharit', time: '07:00' }),
    r({ service: 'shacharit', time: '06:15' }),
    r({ service: 'shacharit', dayType: 'shabbat', time: '06:00' }),
  ], NOW);
  assert.deepEqual(out.map(t => `${t.service}/${t.dayType}/${t.time}`), [
    'shacharit/weekday/06:15', 'shacharit/weekday/07:00', 'shacharit/shabbat/06:00', 'maariv/weekday/19:00',
  ]);
});

test('status: unknown without times, never claims a minyan', () => {
  assert.equal(scheduleStatus([]), 'unknown');
  const [disputed] = summarizeTimes([r({}), r({ kind: 'dispute', reporter: 'z', createdAt: NOW })], NOW);
  assert.equal(disputed.level, 'disputed');
  assert.equal(scheduleStatus([disputed]), 'unknown');
});

test('status: verified beats reported', () => {
  const times = summarizeTimes([r({ verified: true, reporter: 'admin' }), r({ time: '18:00', service: 'maariv' })], NOW);
  assert.equal(scheduleStatus(times), 'verified');
});

test('plausible times per service', () => {
  assert.equal(isPlausibleTime('shacharit', '06:30'), true);
  assert.equal(isPlausibleTime('shacharit', '18:00'), false);
  assert.equal(isPlausibleTime('maariv', '00:30'), true);
  assert.equal(isPlausibleTime('mincha', '25:00'), false);
  assert.equal(isPlausibleTime('mincha', '1:30'), false);
});
