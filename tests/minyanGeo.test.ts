import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversineM, telHref, clampRadius, wazeUrl, googleMapsUrl, nedarimAreaUrl } from '@/lib/minyan/geo';
import { isNewFeature } from '@/lib/newBadges';

test('haversine: 0.0062° of longitude at Jerusalem latitude is ~590m', () => {
  const d = haversineM(31.7767, 35.2283, 31.7767, 35.2345);
  assert.ok(d > 550 && d < 650, String(d));
});

test('tel links only for dialable numbers', () => {
  assert.equal(telHref('02-123 4567'), 'tel:021234567');
  assert.equal(telHref('+972 2 123 4567'), 'tel:+97221234567');
  assert.equal(telHref('12'), null);
});

test('radius is clamped to the offered options', () => {
  assert.equal(clampRadius(5000), 5000);
  assert.equal(clampRadius(999999), 2000);
  assert.equal(clampRadius(NaN), 2000);
});

test('navigation deep links keep their destinations', () => {
  assert.equal(wazeUrl(31.5, 35.1), 'https://waze.com/ul?ll=31.5,35.1&navigate=yes');
  assert.equal(googleMapsUrl(31.5, 35.1), 'https://www.google.com/maps/dir/?api=1&destination=31.5,35.1&travelmode=walking');
});

test('Nedarim Plus link clamps radius to their 0.5–3 km range', () => {
  assert.match(nedarimAreaUrl(31.78, 35.21, 5000), /radius=3&lat=31\.780000&lng=35\.210000$/);
  assert.match(nedarimAreaUrl(31.78, 35.21, 1000), /radius=1&/);
});

test('"new" badge expires automatically after its end date', () => {
  assert.equal(isNewFeature('/minyan', new Date('2026-10-11T12:00:00Z')), true);
  assert.equal(isNewFeature('/minyan', new Date('2027-01-02T00:00:00Z')), false);
  assert.equal(isNewFeature('/unknown'), false);
});
