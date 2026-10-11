/** Source dates are shown exactly as the source publishes them (day precision). */
const DATE_FMT = new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jerusalem' });

export function formatSourceDate(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : DATE_FMT.format(new Date(t));
}
