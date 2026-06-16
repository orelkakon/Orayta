// Standard "mispar hechrachi" (absolute value) gematria letter values.
// Final letters (ך ם ן ף ץ) share the value of their base form.
const LETTER_VALUES: Record<string, number> = {
  'א': 1,   'ב': 2,   'ג': 3,   'ד': 4,   'ה': 5,
  'ו': 6,   'ז': 7,   'ח': 8,   'ט': 9,   'י': 10,
  'כ': 20,  'ך': 20,  'ל': 30,  'מ': 40,  'ם': 40,
  'נ': 50,  'ן': 50,  'ס': 60,  'ע': 70,  'פ': 80,
  'ף': 80,  'צ': 90,  'ץ': 90,  'ק': 100, 'ר': 200,
  'ש': 300, 'ת': 400,
};

// Strips everything but Hebrew letters (nikud, geresh/gershayim, spaces, punctuation).
export function normalizeHebrewWord(word: string): string {
  return word.replace(/[^א-ת]/g, '');
}

export function calculateGematria(word: string): number {
  const letters = normalizeHebrewWord(word);
  let sum = 0;
  for (const ch of letters) sum += LETTER_VALUES[ch] ?? 0;
  return sum;
}
