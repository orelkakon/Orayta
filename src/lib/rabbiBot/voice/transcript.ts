/**
 * Voice questions for רבי־בוט — the pure part (tested): what may be sent for
 * transcription, the vocabulary hint for Whisper, and cleaning its output.
 */
export const AUDIO_MAX_BYTES = 3_000_000;
export const AUDIO_MIN_BYTES = 1_000;
/** Longest recording the client keeps (seconds). */
export const RECORD_MAX_SEC = 60;

const AUDIO_TYPES: Record<string, string> = {
  'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a',
  'audio/aac': 'm4a', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav',
};

/** File extension Whisper needs for a recorder's MIME type (codecs ignored); null when unsupported. */
export function audioExtension(contentType: string | null): string | null {
  const base = (contentType ?? '').split(';')[0].trim().toLowerCase();
  return AUDIO_TYPES[base] ?? null;
}

/**
 * Whisper's prompt: a halachic sentence full of the terms people ask about,
 * so it spells "שמלאכתו לאיסור" and "כזית" instead of near-homophones.
 */
export const WHISPER_PROMPT =
  'שאלה בהלכה ובתורה: שבת, מוקצה, כלי שמלאכתו לאיסור, ברכה ראשונה ואחרונה, כזית, רביעית, ' +
  'נטילת ידיים, בשר וחלב, טבילת כלים, קריאת שמע, שמונה עשרה, תחנון, ספירת העומר, ' +
  'שולחן ערוך, משנה ברורה, כף החיים, בן איש חי, הרמב״ם, גמרא, מסכת, תנאים ואמוראים.';

/** Phrases Whisper invents over silence or noise — never a real question. */
const HALLUCINATIONS = [
  /^תודה( רבה)?( (שצפיתם|על הצפייה|לכם))?[.!]?$/,
  /^(כתוביות|תמלול|תורגם)( על ידי| ע"י)?/,
  /^(שלום|ביי|תודה)[.!]?$/,
  /^(\.|…|,|\s)*$/,
];

/** Trimmed, single-spaced transcript; '' when it's empty or a known hallucination. */
export function cleanTranscript(raw: string): string {
  const text = raw.replace(/[‎‏‪-‮]/g, '').replace(/\s+/g, ' ').trim();
  if (text.length < 2 || HALLUCINATIONS.some(re => re.test(text))) return '';
  return text;
}
