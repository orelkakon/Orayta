import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withoutStreetWord } from '@/lib/minyan/geocodeQuery';

test('regression: "רחוב שטרוק באר שבע" retries as "שטרוק באר שבע"', () => {
  assert.equal(withoutStreetWord('רחוב שטרוק באר שבע'), 'שטרוק באר שבע');
});

test('abbreviations and "ברחוב" are removed as standalone words only', () => {
  assert.equal(withoutStreetWord("רח' הרצל תל אביב"), 'הרצל תל אביב');
  assert.equal(withoutStreetWord('רח׳ הרצל, תל אביב'), 'הרצל, תל אביב');
  assert.equal(withoutStreetWord('ברחוב שטרוק, באר שבע'), 'שטרוק, באר שבע');
  assert.equal(withoutStreetWord('באר שבע רחוב שטרוק'), 'באר שבע שטרוק');
});

test('queries without the generic street word are never altered', () => {
  assert.equal(withoutStreetWord('שטרוק באר שבע'), null);
  assert.equal(withoutStreetWord('שדרות רוטשילד תל אביב'), null); // part of the official name
  assert.equal(withoutStreetWord('רחובות'), null);                // a city, not the word "רחוב"
  assert.equal(withoutStreetWord('בוחר'), null);                  // not a street word — no guessing
});

test('a query that is only the street word yields nothing to retry', () => {
  assert.equal(withoutStreetWord('רחוב'), null);
});
