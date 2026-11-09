import type { RabbiBotAnswer, RabbiBotView } from '@/types/rabbiBot';
import { HE } from '@/lib/hebrewTexts';

/**
 * The answer as a reading script for the device's speech synthesis (pure,
 * tested): what was understood, the short ruling, each view's points, the
 * sources. Abbreviations are spelled out (a voice reads "שו״ע" as "שוע"),
 * and every chunk is one short sentence — iOS and Chrome cut long utterances
 * off. `point` ties a chunk to its point so the screen can follow along.
 */
export interface SpeechChunk { text: string; point?: number }

const VIEWS: RabbiBotView[] = ['main', 'ashkenaz', 'note'];
const MAX_CHUNK = 180;
const MAX_SOURCES = 5;

/** Abbreviation (with ״ or " before its last letter) → how it is said. */
const SAY: [string, string][] = [
  ['שו״ע', 'שולחן ערוך'], ['או״ח', 'אורח חיים'], ['יו״ד', 'יורה דעה'], ['אה״ע', 'אבן העזר'], ['חו״מ', 'חושן משפט'],
  ['מ״ב', 'משנה ברורה'], ['כה״ח', 'כף החיים'], ['בא״ח', 'בן איש חי'], ['ס״ק', 'סעיף קטן'], ['ע״א', 'עמוד א'],
  ['ע״ב', 'עמוד ב'], ['הקב״ה', 'הקדוש ברוך הוא'], ['זצ״ל', 'זכר צדיק לברכה'], ['ז״ל', 'זכרונם לברכה'],
  ['רע״א', 'רבי עקיבא איגר'], ['וכו׳', 'וכולי'], ['ר׳', 'רבי'],
];
// A whole word, optionally after one or two prefix letters (בשו״ע, והרמ״א) — never inside another word.
const ABBREVIATIONS: [RegExp, string][] = SAY.map(([abbr, full]) => [
  new RegExp(`(?<=(?:^|[^א-ת])[ובהלכמש]{0,2})${abbr.replace(/[״׳]/, m => (m === '״' ? '["״]' : "['׳]"))}(?![א-ת])`, 'g'),
  full,
]);

/** Text a Hebrew voice reads naturally: abbreviations expanded, quote marks and brackets dropped. */
export function speakable(text: string): string {
  let s = text;
  for (const [re, full] of ABBREVIATIONS) s = s.replace(re, full);
  return s.replace(/[״"׳'`]/g, '').replace(/[()[\]{}]/g, ', ').replace(/\s*,\s*(,\s*)+/g, ', ')
    .replace(/\s+/g, ' ').replace(/\s+([,.:;!?])/g, '$1').trim();
}

/** Sentences of at most `max` chars (split further at commas, then words, when needed). */
export function sentences(text: string, max = MAX_CHUNK): string[] {
  const out: string[] = [];
  for (const sentence of text.split(/(?<=[.!?;])\s+/)) {
    let rest = sentence.trim();
    while (rest.length > max) {
      const cut = Math.max(rest.lastIndexOf(', ', max), rest.lastIndexOf(' ', max));
      const at = cut > max / 3 ? cut : max;
      out.push(rest.slice(0, at).replace(/,$/, '').trim());
      rest = rest.slice(at + 1).trim();
    }
    if (rest) out.push(rest);
  }
  return out;
}

export function answerSpeech(answer: RabbiBotAnswer): SpeechChunk[] {
  const chunks: SpeechChunk[] = [];
  const add = (text: string | undefined, point?: number) => {
    if (!text) return;
    for (const s of sentences(speakable(text))) chunks.push(point === undefined ? { text: s } : { text: s, point });
  };
  if (answer.status !== 'answered') return chunks;
  if (answer.understood) add(`${HE.RB_UNDERSTOOD} ${answer.understood}.`);
  if (answer.byRule) add(`${HE.RB_BY_RULE_TITLE}. ${HE.RB_BY_RULE_TEXT}`);
  add(answer.short);
  const labels = answer.kind === 'torah' ? HE.RB_VIEW_TORAH : HE.RB_VIEW;
  for (const view of VIEWS) {
    const points = answer.points.map((p, i) => ({ p, i })).filter(x => x.p.view === view);
    if (points.length === 0) continue;
    add(`${labels[view]}.`);
    points.forEach(({ p, i }) => add(p.text, i));
  }
  const refs = answer.sources.slice(0, MAX_SOURCES).map(s => s.heRef);
  if (refs.length) add(`${HE.RB_SOURCES}: ${refs.join(', ')}.`);
  return chunks;
}
