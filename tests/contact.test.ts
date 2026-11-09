import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseContact, replyEmail, escapeHtml, waPhone, waLink, contactWaText } from '@/lib/contact';

test('parseContact: requires a message and cleans the optional fields', () => {
  assert.equal(parseContact(null), null);
  assert.equal(parseContact({ message: '   ' }), null);
  assert.equal(parseContact({ message: 'x'.repeat(2001) }), null);
  const c = parseContact({ message: ' שלום‮ ', name: '  ', replyTo: 'a@b.co', rating: 7, topic: 'nope' });
  assert.deepEqual(c, { message: 'שלום', name: undefined, replyTo: 'a@b.co', rating: undefined, topic: undefined });
  assert.equal(parseContact({ message: 'x', rating: 4, topic: 'mistake' })?.rating, 4);
  assert.equal(parseContact({ message: 'x', topic: 'mistake' })?.topic, 'mistake');
  assert.equal(parseContact({ message: 'x', rating: 2.5 })?.rating, undefined);
});

test('replyEmail: only a real address becomes Reply-To', () => {
  assert.equal(replyEmail('me@example.com'), 'me@example.com');
  assert.equal(replyEmail('050-1234567'), undefined);
  assert.equal(replyEmail('a@b'), undefined);
  assert.equal(replyEmail(undefined), undefined);
});

test('escapeHtml neutralises markup in the admin email', () => {
  assert.equal(escapeHtml('<img src=x onerror="a">&'), '&lt;img src=x onerror=&quot;a&quot;&gt;&amp;');
});

test('WhatsApp: digits-only number, encoded draft with topic and rating', () => {
  assert.equal(waPhone('+972-50-123-4567'), '972501234567');
  assert.equal(waPhone(''), null);
  assert.equal(waLink('972501234567'), 'https://wa.me/972501234567');
  const text = contactWaText({ name: 'דוד', message: 'יש טעות', rating: 5, topic: 'mistake' });
  assert.match(text, /^היי, אני דוד 👋\nפניתי דרך אורייתא\nנושא: דיווח על טעות\n\nיש טעות\n\nדירוג: 5\/5$/);
  assert.equal(contactWaText({ message: 'שלום' }), 'היי 👋\nפניתי דרך אורייתא\n\nשלום');
  assert.ok(waLink('1234567890', 'a b&c').endsWith('?text=a%20b%26c'));
});
