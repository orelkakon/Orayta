import { test } from 'node:test';
import assert from 'node:assert/strict';
import { personFromSite, keepOsm, sameSite, cleanExtract, isBlocked } from '@/lib/kivrei/build';
import { matchRabbi, nameKey } from '@/lib/kivrei/rabbiMatch';
import { clampKivreiRadius } from '@/lib/kivrei/radius';

test('personFromSite: grave names → the buried person', () => {
  assert.equal(personFromSite('קבר רבי שמעון בר יוחאי'), 'רבי שמעון בר יוחאי');
  assert.equal(personFromSite('קבר הנביא חבקוק (איראן)'), 'הנביא חבקוק');
  assert.equal(personFromSite('ציון קבר רבי חנניה בן עקשיא'), 'רבי חנניה בן עקשיא');
  assert.equal(personFromSite('קבר הארי ז"ל'), 'הארי');
  assert.equal(personFromSite('מערת הלל'), 'הלל');
  assert.equal(personFromSite('אוהל אדמו"רי חב"ד בניו יורק'), 'אדמו"רי חב"ד בניו יורק');
  assert.equal(personFromSite('אוהל יצחק'), null, '"אוהל" without a tzadik title is a hall, not a grave');
  assert.equal(personFromSite('גוש חלב'), null);
  assert.equal(personFromSite('מערת קבורה'), null);
});

test('keepOsm: tzadikim graves only', () => {
  assert.equal(keepOsm({ name: 'קבר רבי טרפון' }), true);
  assert.equal(keepOsm({ name: 'קבר הרמח"ל' }), true);
  assert.equal(keepOsm({ name: 'רבי אבא שאול', historic: 'tomb' }), true);
  assert.equal(keepOsm({ name: 'מערת קבורה חצובה', historic: 'tomb' }), false);
  assert.equal(keepOsm({ name: 'קבר בן-גוריון', historic: 'tomb' }), false);
  assert.equal(keepOsm({ name: "שייח' זייתון", historic: 'tomb' }), false);
  assert.equal(keepOsm({ name: 'אוהל משה' }), false);
  assert.equal(keepOsm({ name: 'קבר 4 כוכים' }), false);
  assert.equal(isBlocked('מצבת זיכרון השיירה'), true);
});

test('sameSite: very close, or near with a shared name word', () => {
  const a = { name: 'קבר רבי מאיר בעל הנס', lat: 32.7764, lng: 35.5455 };
  assert.equal(sameSite(a, { name: 'ציון', lat: 32.7765, lng: 35.5455 }), true);
  assert.equal(sameSite(a, { name: 'רבי מאיר', lat: 32.7790, lng: 35.5455 }), true);
  assert.equal(sameSite(a, { name: 'קבר רבי יוחנן', lat: 32.7790, lng: 35.5455 }), false);
  assert.equal(sameSite(a, { name: 'רבי מאיר', lat: 32.80, lng: 35.5455 }), false);
});

test('cleanExtract trims to a sentence', () => {
  assert.equal(cleanExtract('קצר'), null);
  const long = `${'א'.repeat(200)}. ${'ב'.repeat(200)}.`;
  assert.equal(cleanExtract(long), `${'א'.repeat(200)}.`);
});

test('matchRabbi: titles and word order ignored, ambiguity links to nobody', () => {
  const rabbis = [
    { name: 'חבקוק הנביא', fullName: null },
    { name: 'באבא סאלי', fullName: 'רבי ישראל אבוחצירא' },
    { name: 'הרמב״ם', fullName: null },
    { name: 'שמואל', fullName: null },
    { name: 'שמואל הנביא', fullName: null },
  ];
  assert.equal(nameKey('רבי שמעון  בר יוחאי'), nameKey('שמעון בר יוחאי'));
  assert.equal(matchRabbi('הנביא חבקוק', rabbis)?.name, 'חבקוק הנביא');
  assert.equal(matchRabbi('הבאבא סאלי', rabbis)?.name, 'באבא סאלי');
  assert.equal(matchRabbi('הרמב"ם', rabbis)?.name, 'הרמב״ם');
  assert.equal(matchRabbi('הנביא שמואל', rabbis), null);
  assert.equal(matchRabbi(null, rabbis), null);
  assert.equal(clampKivreiRadius(1), 15000);
});

test('"אוהל" with only an acronym is a hall', () => {
  assert.equal(personFromSite('אוהל הרשב"י'), null);
  assert.equal(keepOsm({ name: 'אוהל הרשב"י' }), false);
});
