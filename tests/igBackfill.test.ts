import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runBackfill, gapClosed, BackfillDeps, IgPost, ReelInspection, BackfillEvent } from '@/lib/igBackfill';

const post = (code: string, over: Partial<IgPost> = {}): IgPost => ({ code, isVideo: true, pinned: false, ...over });
const ok: ReelInspection = { durationSec: 30, playable: true };

function harness(opts: {
  pages: IgPost[][];
  existing?: string[];
  inspect?: Record<string, ReelInspection>;
  passed?: string[];
  failPage?: number;
  insertFails?: string[];
}) {
  const db = new Set(opts.existing ?? []);
  const inserted: string[] = [];
  const events: BackfillEvent[] = [];
  const deps: BackfillDeps = {
    sourceName: 'graph',
    listPosts: async cursor => {
      const i = cursor ? Number(cursor) : 0;
      if (i === opts.failPage) throw new Error('boom');
      return { posts: opts.pages[i] ?? [], nextCursor: i + 1 < opts.pages.length ? String(i + 1) : null };
    },
    inspectReel: async code => opts.inspect?.[code] ?? ok,
    existingCodes: async codes => new Set(codes.filter(c => db.has(c))),
    insertReel: async code => {
      if (opts.insertFails?.includes(code) || db.has(code)) return false;
      db.add(code); inserted.push(code); return true;
    },
    passed: new Set(opts.passed ?? []),
  };
  const run = (limit = 10) => runBackfill(deps, { limit, maxSeconds: 60, maxPages: 10, deadline: Date.now() + 60_000 }, e => events.push(e));
  return { run, inserted, events };
}

test('imports newest missing reels and stops at the first existing one', async () => {
  const h = harness({ pages: [[post('n1'), post('n2'), post('old1'), post('n3')]], existing: ['old1'] });
  const s = await h.run();
  assert.deepEqual(h.inserted, ['n1', 'n2']);
  assert.equal(s.stopReason, 'reached-existing');
  assert.equal(s.stoppedAt, 'old1');
  assert.ok(gapClosed(s.stopReason));
});

test('a pinned old post at the top does not end the gap', async () => {
  const h = harness({ pages: [[post('pinnedOld', { pinned: true }), post('n1'), post('old')]], existing: ['pinnedOld', 'old'] });
  const s = await h.run();
  assert.deepEqual(h.inserted, ['n1']);
  assert.equal(s.stoppedAt, 'old');
});

test('skips too-long, non-playable, unverifiable and non-video posts but keeps walking', async () => {
  const h = harness({
    pages: [[post('long'), post('broken'), post('flaky'), post('photo', { isVideo: false }), post('good'), post('old')]],
    existing: ['old'],
    inspect: {
      long: { durationSec: 600, playable: true },
      broken: { durationSec: 0, playable: false },
      flaky: { durationSec: null, playable: null },
    },
  });
  const s = await h.run();
  assert.deepEqual(h.inserted, ['good']);
  assert.deepEqual(s.skipped, { 'too-long': 1, 'not-playable': 1, unverified: 1, 'not-video': 1 });
  // unverified is retried next time, so it is not remembered as handled
  assert.deepEqual(s.passed.sort(), ['broken', 'good', 'long']);
});

test('caps at the per-run limit across pages and reports it', async () => {
  const pages = [Array.from({ length: 8 }, (_, i) => post(`a${i}`)), Array.from({ length: 8 }, (_, i) => post(`b${i}`))];
  const h = harness({ pages });
  const s = await h.run(10);
  assert.equal(h.inserted.length, 10);
  assert.equal(s.stopReason, 'limit');
  assert.equal(gapClosed(s.stopReason), false);
});

test('a resumed run steps over its own earlier imports instead of stopping', async () => {
  const pages = [[post('a'), post('b'), post('c'), post('old')]];
  const h = harness({ pages, existing: ['a', 'b', 'old'], passed: ['a', 'b'] });
  const s = await h.run();
  assert.deepEqual(h.inserted, ['c']);
  assert.equal(s.stopReason, 'reached-existing');
});

test('source exhausted before reaching existing content', async () => {
  const h = harness({ pages: [[post('n1')]] });
  const s = await h.run();
  assert.equal(s.stopReason, 'source-exhausted');
});

test('first listing failure throws; later failure keeps partial results', async () => {
  await assert.rejects(harness({ pages: [[post('x')]], failPage: 0 }).run(), /boom/);
  const h = harness({ pages: [[post('n1')], [post('n2')]], failPage: 1 });
  const s = await h.run();
  assert.deepEqual(h.inserted, ['n1']);
  assert.equal(s.stopReason, 'source-error');
  assert.deepEqual(s.errors, ['boom']);
});

test('a concurrent insert of the same reel ends the gap without duplicates', async () => {
  const h = harness({ pages: [[post('n1'), post('raced'), post('n3')]], insertFails: ['raced'] });
  const s = await h.run();
  assert.deepEqual(h.inserted, ['n1']);
  assert.equal(s.stopReason, 'reached-existing');
});

test('emits progress and a terminal done event', async () => {
  const h = harness({ pages: [[post('n1'), post('old')]], existing: ['old'] });
  await h.run();
  assert.ok(h.events.some(e => e.type === 'progress' && e.added === 1));
  assert.equal(h.events[h.events.length - 1].type, 'done');
});
