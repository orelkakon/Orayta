import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, classifySchedule, scheduleFingerprint, EXISTENCE_CURRENT_DAYS } from '@/lib/minyan/reliability';
import type { ScheduleText, ProviderId } from '@/types/minyan';

const NOW = new Date('2026-10-11T12:00:00Z');
const ago = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();
const ev = (provider: ProviderId, updatedAt: string | null, family: string = provider) => ({ provider, family, updatedAt });

test('high: two independent current sources', () => {
  assert.deepEqual(classify([ev('osm', ago(100)), ev('muni-beersheva', ago(6))], NOW, EXISTENCE_CURRENT_DAYS),
    { level: 'high', reason: 'multi', independent: 2, total: 2 });
});

test('medium: one current source', () => {
  assert.deepEqual(classify([ev('osm', ago(100))], NOW, EXISTENCE_CURRENT_DAYS),
    { level: 'medium', reason: 'single', independent: 1, total: 1 });
});

test('copies of one underlying source never count as corroboration', () => {
  const r = classify([ev('osm', ago(10)), ev('muni-beersheva', ago(10), 'osm')], NOW, EXISTENCE_CURRENT_DAYS);
  assert.equal(r.level, 'medium');
  assert.equal(r.independent, 1);
});

test('low: stale or undated evidence only', () => {
  assert.deepEqual(classify([ev('osm', ago(EXISTENCE_CURRENT_DAYS + 30))], NOW, EXISTENCE_CURRENT_DAYS),
    { level: 'low', reason: 'stale', independent: 0, total: 1 });
  assert.deepEqual(classify([ev('wikidata', null)], NOW, EXISTENCE_CURRENT_DAYS),
    { level: 'low', reason: 'undated', independent: 0, total: 1 });
});

test('one current + one stale independent source is medium, not high', () => {
  assert.deepEqual(classify([ev('osm', ago(10)), ev('wikidata', ago(4000))], NOW, EXISTENCE_CURRENT_DAYS),
    { level: 'medium', reason: 'single', independent: 1, total: 2 });
});

const sch = (provider: ProviderId, text: Partial<ScheduleText>, updatedAt: string | null): ScheduleText =>
  ({ provider, weekday: null, shabbat: null, general: null, updatedAt, ...text });

test('schedule: none published → null (shown as unknown)', () => {
  assert.equal(classifySchedule([], new Map(), NOW), null);
});

test('schedule: one current source → medium; stale → low', () => {
  assert.equal(classifySchedule([sch('osm', { general: 'Mo-Fr 07:00' }, ago(30))], new Map(), NOW)?.level, 'medium');
  assert.equal(classifySchedule([sch('osm', { general: 'Mo-Fr 07:00' }, ago(400))], new Map(), NOW)?.reason, 'stale');
});

test('schedule: two independent current sources with the same times → high; different → conflict', () => {
  const a = sch('osm', { general: 'Mo-Fr 7:00, 19:30' }, ago(20));
  const same = sch('muni-telaviv', { weekday: 'שחרית-07:00, ערבית-19.30' }, ago(40));
  const diff = sch('muni-telaviv', { weekday: 'שחרית-06:30' }, ago(40));
  assert.equal(classifySchedule([a, same], new Map(), NOW)?.level, 'high');
  assert.deepEqual(classifySchedule([a, diff], new Map(), NOW), { level: 'low', reason: 'conflict', independent: 2, total: 2 });
});

test('schedule: agreement cannot be established without times on both sides', () => {
  const a = sch('osm', { general: 'by appointment' }, ago(20));
  const b = sch('muni-telaviv', { weekday: 'שחרית-07:00' }, ago(20));
  assert.equal(classifySchedule([a, b], new Map(), NOW)?.level, 'medium');
});

test('fingerprint normalizes separators and padding', () => {
  assert.equal(scheduleFingerprint(sch('osm', { general: '7:00 / 19.30' }, null)), '07:00,19:30');
});
