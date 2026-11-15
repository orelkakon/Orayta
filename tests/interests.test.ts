import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Block, Tile, orderBlocks, parsePrefs, pickTiles } from '../src/lib/interests';

const D: Tile[] = [
  { href: '/siddur', icon: '', label: 'סידור', tags: ['prayer'] },
  { href: '/ask', icon: '', label: 'בוט', tags: ['knowledge'] },
  { href: '/study', icon: '', label: 'תלמוד', tags: ['learning'] },
  { href: '/quiz', icon: '', label: 'תרגול', tags: ['knowledge'] },
];
const POOL: Tile[] = [
  { href: '/minyan', icon: '', label: 'מניין', tags: ['community', 'prayer'] },
  { href: '/parasha', icon: '', label: 'פרשה', tags: ['learning'] },
  { href: '/siddur', icon: '', label: 'כפול', tags: ['prayer'] },
];

test('no interests = exactly the default tiles', () => {
  assert.deepEqual(pickTiles(D, POOL, []), D);
});

test('interests bring in matching tiles, keep the count, and show them in natural order', () => {
  const got = pickTiles(D, POOL, ['learning']).map(t => t.href);
  // study + parasha match; the rest fill by default order; shown defaults-first.
  assert.deepEqual(got, ['/siddur', '/ask', '/study', '/parasha']);
  // A tile serving two picked interests beats one serving one.
  assert.equal(pickTiles(D, POOL, ['prayer', 'community'], 1)[0].href, '/minyan');
  // Duplicates from the pool are ignored.
  assert.equal(pickTiles(D, POOL, ['prayer']).filter(t => t.href === '/siddur').length, 1);
});

test('blocks serving picked interests rise; equals keep their order', () => {
  const blocks: Block<'feed' | 'quick' | 'x'>[] = [
    { key: 'feed', tags: ['learning'] }, { key: 'quick', tags: ['prayer', 'knowledge'] }, { key: 'x', tags: [] },
  ];
  assert.deepEqual(orderBlocks(blocks, []), ['feed', 'quick', 'x']);
  assert.deepEqual(orderBlocks(blocks, ['prayer']), ['quick', 'feed', 'x']);
  assert.deepEqual(orderBlocks(blocks, ['learning']), ['feed', 'quick', 'x']);
  assert.deepEqual(orderBlocks(blocks, ['community']), ['feed', 'quick', 'x']);
});

test('stored prefs are validated', () => {
  assert.deepEqual(parsePrefs(null), { picked: [], asked: false });
  assert.deepEqual(parsePrefs('garbage'), { picked: [], asked: false });
  assert.deepEqual(parsePrefs('{"picked":["community","bogus","prayer"],"asked":true}'), { picked: ['prayer', 'community'], asked: true });
});
