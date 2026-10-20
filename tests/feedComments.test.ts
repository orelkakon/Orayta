import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateComment, normalizeCommentText, commentAge, avatarTint, isCommentTarget, COMMENT_TEXT_MAX } from '@/lib/feedComments';

test('valid comment: trims and keeps optional name', () => {
  assert.deepEqual(validateComment('  משה ', '  יפה מאוד  '), { ok: true, name: 'משה', text: 'יפה מאוד' });
  assert.deepEqual(validateComment('', 'יישר כח'), { ok: true, name: null, text: 'יישר כח' });
  assert.deepEqual(validateComment(undefined, 'יישר כח'), { ok: true, name: null, text: 'יישר כח' });
});

test('rejects empty, too short and too long texts', () => {
  assert.deepEqual(validateComment('', '   '), { ok: false, error: 'empty' });
  assert.deepEqual(validateComment('', 'א'), { ok: false, error: 'too_short' });
  assert.deepEqual(validateComment('', 'א'.repeat(COMMENT_TEXT_MAX + 1)), { ok: false, error: 'too_long' });
  assert.deepEqual(validateComment('א'.repeat(31), 'טוב'), { ok: false, error: 'name_too_long' });
});

test('rejects links in text or name', () => {
  assert.deepEqual(validateComment('', 'ראו https://spam.example'), { ok: false, error: 'link' });
  assert.deepEqual(validateComment('', 'כנסו ל www.spam'), { ok: false, error: 'link' });
  assert.deepEqual(validateComment('buy-now.com', 'שלום'), { ok: false, error: 'link' });
  assert.equal(validateComment('', 'דף ב. עמוד א.').ok, true);
});

test('normalizes whitespace and strips bidi/control characters', () => {
  assert.equal(normalizeCommentText('a\r\n\n\n\nb'), 'a\n\nb');
  assert.equal(normalizeCommentText('a    b'), 'a b');
  assert.equal(normalizeCommentText('‮שלום‏'), 'שלום');
});

test('commentAge buckets', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  const ago = (ms: number) => commentAge(new Date(now.getTime() - ms), now);
  assert.deepEqual(ago(10_000), { unit: 'now' });
  assert.deepEqual(ago(5 * 60_000), { unit: 'min', n: 5 });
  assert.deepEqual(ago(3 * 3600_000), { unit: 'hour', n: 3 });
  assert.deepEqual(ago(2 * 86400_000), { unit: 'day', n: 2 });
  assert.deepEqual(ago(15 * 86400_000), { unit: 'week', n: 2 });
  assert.equal(ago(60 * 86400_000).unit, 'date');
});

test('avatarTint is deterministic and targets are validated', () => {
  assert.equal(avatarTint('משה'), avatarTint('משה'));
  assert.equal(isCommentTarget('reel'), true);
  assert.equal(isCommentTarget('dedication'), false);
  assert.equal(isCommentTarget(5), false);
});
