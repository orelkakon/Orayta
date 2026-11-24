import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGate, MAX_RETRIES, RETRY_BUDGET_MS, retryDelay } from '@/lib/rabbiBot/sefariaGate';

const mid = () => 0.5;

test('throttling and server errors are retried with growing waits; missing texts are not', () => {
  assert.equal(retryDelay(429, 0, null, 0, mid), 500);
  assert.equal(retryDelay(429, 1, null, 0, mid), 1000);
  assert.equal(retryDelay(503, 2, null, 0, mid), 2000);
  assert.equal(retryDelay(0, 0, null, 0, mid), 500); // no response at all
  assert.equal(retryDelay(404, 0, null, 0, mid), null);
  assert.equal(retryDelay(400, 0, null, 0, mid), null);
  assert.equal(retryDelay(-1, 0, null, 0, mid), null); // a timeout already spent 9 s
});

test('retries stop after MAX_RETRIES', () => {
  assert.notEqual(retryDelay(429, MAX_RETRIES - 1, null, 0, mid), null);
  assert.equal(retryDelay(429, MAX_RETRIES, null, 0, mid), null);
});

test('Retry-After is honoured, capped, and ignored when unusable', () => {
  assert.equal(retryDelay(429, 0, '2', 0, mid), 2000);
  assert.equal(retryDelay(429, 0, '60', 0, mid), 4000);
  assert.equal(retryDelay(429, 0, '', 0, mid), 500);
  assert.equal(retryDelay(429, 0, 'Wed, 21 Oct 2026 07:28:00 GMT', 0, mid), 500);
});

test('a retry that would run past the budget is not made', () => {
  assert.equal(retryDelay(429, 1, '4', 1500, mid), 4000);
  assert.equal(retryDelay(429, 1, '4', RETRY_BUDGET_MS - 3000, mid), null);
  assert.equal(retryDelay(429, 0, null, RETRY_BUDGET_MS, mid), null);
});

test('jitter stays within ±25%', () => {
  assert.equal(retryDelay(429, 1, null, 0, () => 0), 750);
  assert.equal(retryDelay(429, 1, null, 0, () => 1), 1250);
});

test('the gate never runs more than max tasks at once, and runs them all', async () => {
  const gate = createGate(2);
  let running = 0;
  let peak = 0;
  const task = (i: number) => gate.run(async () => {
    running++; peak = Math.max(peak, running);
    await new Promise(r => setTimeout(r, 5));
    running--;
    return i;
  });
  const out = await Promise.all([1, 2, 3, 4, 5].map(task));
  assert.deepEqual(out, [1, 2, 3, 4, 5]);
  assert.equal(peak, 2);
  assert.equal(gate.active, 0);
});

test('a failing task frees its slot', async () => {
  const gate = createGate(1);
  await assert.rejects(gate.run(async () => { throw new Error('x'); }));
  assert.equal(await gate.run(async () => 7), 7);
  assert.equal(gate.active, 0);
});

test('a pause holds tasks that have not started yet', async () => {
  const gate = createGate(3);
  gate.pause(40);
  const t = Date.now();
  await gate.run(async () => undefined);
  assert.ok(Date.now() - t >= 35);
});
