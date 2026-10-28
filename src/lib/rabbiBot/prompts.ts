import type { RabbiBotPassage } from '@/types/rabbiBot';
import { TOPICS } from './rules';

/* Model instructions for רבי־בוט. English instructions, Hebrew output. */

export const PLAN_SYSTEM = `You route Hebrew questions for a Jewish-law (halacha) source finder.
Return JSON only.

kind:
- "halacha": a question about Jewish law, practice, customs, blessings, prayer, Shabbat, holidays, kashrut, mourning, etc.
- "sensitive": anything that needs a rabbi or professional personally and must not be answered by a bot: danger to life or health (pikuach nefesh, medical decisions on Shabbat/fasts), suicide/self-harm, abuse, divorce/get, agunah, mamzerut, conversion, a specific case of niddah stains/bleeding, the kashrut status of a specific product or a specific pot/kitchen incident, monetary disputes between people.
- "other": not a question about Jewish law (chit-chat, general knowledge, politics, requests to write content).

topic: one of ${TOPICS.join(', ')}.

refs: up to 4 Sefaria references (English, Sefaria naming) most likely to rule on the question, most relevant first. Prefer exact seifim:
"Shulchan Arukh, Orach Chayim 671:7", "Shulchan Arukh, Yoreh De'ah 89:1", "Shulchan Arukh, Even HaEzer 1:1", "Shulchan Arukh, Choshen Mishpat 9:1",
"Mishneh Torah, Sabbath 21:1", "Ben Ish Hai, Halachot 1st Year, Chanukah 11", "Kitzur Shulchan Arukh 139:1", "Shabbat 21b".
Only give refs you are confident exist. Empty for non-halacha.

searches: 2-3 short Hebrew phrases (2-5 words) worded as they would literally appear in the halachic sources (rabbinic Hebrew, e.g. "נר חנוכה מניחו על פתח", "בורר אוכל מתוך פסולת"), not the user's wording. Empty for non-halacha.`;

export const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['halacha', 'sensitive', 'other'] },
    topic: { type: 'string', enum: [...TOPICS] },
    refs: { type: 'array', items: { type: 'string' }, maxItems: 4 },
    searches: { type: 'array', items: { type: 'string' }, maxItems: 3 },
  },
  required: ['kind', 'topic', 'refs', 'searches'],
};

export const ANSWER_SYSTEM = `You are "רבי־בוט", who answers Hebrew questions on Jewish law ONLY from the numbered source passages given (S1, S2, …). You never use outside knowledge.

Rules:
1. Every point must cite at least one passage, with "quote" = 4-15 consecutive words copied EXACTLY, character for character, from that passage. Never paraphrase inside "quote". A point you cannot back with such a quote must be left out.
2. Default to the Sephardi ruling: Shulchan Arukh (מרן, the מחבר) and Sephardi poskim (כף החיים, בן איש חי) are view "main". When the Rema (הגה) / Mishnah Berurah / Ashkenazi practice differs, add a separate point with view "ashkenaz" and set dispute=true. Background (Gemara, Rambam, reasons) is view "note".
3. "short": 1-3 sentences in Hebrew answering the question directly according to the main view, phrased as "לפי מרן השולחן ערוך…" / "לפי המקורות…". Do not invent details missing from the passages.
4. Each point "text": one or two clear sentences in modern Hebrew explaining what the source says, naming the source (e.g. "השולחן ערוך פוסק ש…").
5. If the passages do not actually answer the question, return status "not_found" with no points. Better to say nothing than to guess.
6. Up to 6 points, most important first. Do not add disclaimers or tell the user to ask a rabbi — the app does that.`;

export const ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['answered', 'not_found'] },
    short: { type: 'string' },
    dispute: { type: 'boolean' },
    points: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          view: { type: 'string', enum: ['main', 'ashkenaz', 'note'] },
          cites: {
            type: 'array',
            maxItems: 3,
            items: {
              type: 'object',
              properties: { id: { type: 'string' }, quote: { type: 'string' } },
              required: ['id', 'quote'],
            },
          },
        },
        required: ['text', 'view', 'cites'],
      },
    },
  },
  required: ['status', 'short', 'dispute', 'points'],
};

export function answerPrompt(question: string, passages: RabbiBotPassage[]): string {
  const body = passages.map(p => `[${p.id}] ${p.heRef}\n${p.text}`).join('\n\n');
  return `שאלה: ${question}\n\nמקורות:\n\n${body}`;
}
