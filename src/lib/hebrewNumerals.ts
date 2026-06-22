const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDS = ['', 'ק', 'ר', 'ש', 'ת'];

export function toHebrewNumeral(n: number): string {
  if (n <= 0 || n > 9999) return String(n);

  let result = '';
  const h = Math.floor(n / 100);
  const rem = n % 100;

  if (h > 0) result += h <= 4 ? HUNDS[h] : 'ת' + HUNDS[h - 4];

  if (rem === 15) return result + 'טו';
  if (rem === 16) return result + 'טז';

  result += TENS[Math.floor(rem / 10)];
  result += ONES[rem % 10];
  return result;
}
