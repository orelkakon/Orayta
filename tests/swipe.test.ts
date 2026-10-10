import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifySwipe, isInEdgeGuard, SWIPE_EDGE_GUARD_PX } from '@/lib/swipe';

test('clear horizontal flick right → next (right)', () => {
  assert.equal(classifySwipe({ dx: 120, dy: 10, elapsedMs: 200 }), 'right');
});

test('clear horizontal flick left → previous (left)', () => {
  assert.equal(classifySwipe({ dx: -90, dy: -20, elapsedMs: 300 }), 'left');
});

test('vertical scroll never navigates', () => {
  assert.equal(classifySwipe({ dx: 40, dy: 300, elapsedMs: 250 }), null);
  assert.equal(classifySwipe({ dx: 100, dy: 80, elapsedMs: 250 }), null); // diagonal
});

test('short or slow drags (text selection) are ignored', () => {
  assert.equal(classifySwipe({ dx: 30, dy: 0, elapsedMs: 100 }), null);
  assert.equal(classifySwipe({ dx: 200, dy: 0, elapsedMs: 1500 }), null);
});

test('edge guard protects the OS back gesture', () => {
  assert.equal(isInEdgeGuard(5, 400), true);
  assert.equal(isInEdgeGuard(400 - SWIPE_EDGE_GUARD_PX + 1, 400), true);
  assert.equal(isInEdgeGuard(200, 400), false);
});
