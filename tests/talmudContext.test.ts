import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHebrew, wordKeys, findCitationSegment } from '@/lib/talmud/contextMatch';
import { tractateFor, parseDaf, parseAmud, parseSefariaRef, hebrewAmudLabel } from '@/lib/talmud/tractates';

const seg = (he: string, ex = '') => ({ he, ex });

test('normalizeHebrew strips nikud, HTML, punctuation and final forms', () => {
  assert.equal(normalizeHebrew('<big><strong>מֵאֵימָתַי</strong></big> קוֹרִין אֶת שְׁמַע'), 'מאימתי קורינ את שמע');
  assert.equal(normalizeHebrew('הקב״ה, רמב"ם — בית־המקדש!'), 'הקבה רמבמ בית המקדש');
});

test('wordKeys bridge prefixes and full/defective spelling', () => {
  const shared = (a: string, b: string) => wordKeys(a).some(k => wordKeys(b).includes(k));
  assert.ok(shared('והמקדש', 'מקדש'));
  assert.ok(shared('אורחים', 'ארחים'));
  assert.ok(shared('מלכא', 'מלכ'));
  assert.ok(!shared('שבת', 'תורה'));
});

test('finds the segment that quotes the saying', () => {
  const page = [
    seg('תָּנוּ רַבָּנַן: הַקּוֹרֵא אֶת שְׁמַע', 'שנו חכמים בברייתא: הקורא את שמע'),
    seg('אָמַר רַבִּי יוֹחָנָן: אוֹי לָהּ לָרַבָּנוּת שֶׁמְּקַבֶּרֶת אֶת בְּעָלֶיהָ', 'אמר ר׳ יוחנן: אוי לה לרבנות [לשררה] שמקברת את בעליה, שמקצרת את ימיהם'),
    seg('וְאָמַר רַבִּי אֱלִיעֶזֶר: כׇּל הָעוֹסֵק בְּתוֹרָה', 'ואמר ר׳ אליעזר: כל העוסק בתורה'),
  ];
  const m = findCitationSegment('אוי לה לרבנות (שררה) שמקברת את בעליה ומקצרת את ימיהם', page);
  assert.equal(m?.index, 1);
});

test('returns null when nothing on the page is convincing', () => {
  const page = [seg('אָמַר רָבָא: שַׁבָּת', 'אמר רבא: שבת'), seg('תְּפִלָּה', 'תפילה')];
  assert.equal(findCitationSegment('נחשים = סטרא אחרא', page), null);
  assert.equal(findCitationSegment('כל דבר', []), null);
});

test('a saying repeated in two segments resolves to the first', () => {
  const page = [
    seg('מִשְׁנָה: אֵין דּוֹרְשִׁין בַּעֲרָיוֹת בִּשְׁלֹשָׁה', 'משנה: אין דורשין בעריות בשלשה'),
    seg('אֵין דּוֹרְשִׁין בַּעֲרָיוֹת בִּשְׁלֹשָׁה, מַאי טַעְמָא', 'שנינו: אין דורשין בעריות בשלשה. מה טעם הדבר'),
    seg('אָמַר רַב יְהוּדָה', 'אמר רב יהודה'),
  ];
  assert.equal(findCitationSegment('אין דורשים בעריות בשלושה', page)?.index, 0);
});

test('tractate names, daf and amud parsing', () => {
  assert.equal(tractateFor('בבא קמא'), 'Bava Kamma');
  assert.equal(tractateFor('נידה'), 'Niddah');
  assert.equal(tractateFor('ירושלמי'), null);
  assert.equal(parseDaf('ל״ב'), 32);
  assert.equal(parseDaf('קכ״ב'), 122);
  assert.equal(parseDaf('12'), 12);
  assert.equal(parseDaf('א'), null);
  assert.equal(parseDaf(''), null);
  assert.equal(parseAmud('ב'), 'b');
  assert.equal(parseAmud(null), null);
  assert.deepEqual(parseSefariaRef('Bava Kamma 4b'), { daf: 4, amud: 'b' });
  assert.equal(parseSefariaRef(null), null);
  assert.equal(hebrewAmudLabel('ברכות', { daf: 32, amud: 'a' }), 'ברכות ל״ב ע״א');
  assert.equal(hebrewAmudLabel('שבת', { daf: 4, amud: 'b' }), 'שבת ד׳ ע״ב');
});
