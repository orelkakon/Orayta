import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { sendAdminEmail } from '@/lib/mailer';
import { HE } from '@/lib/hebrewTexts';
import { answerModels, botModels, isBackupModel } from './gemini';
import { quotaDay, quotaResetAt } from './rules';

// Server-only. A model that hit its daily quota is remembered in AppConfig
// until the quota day (Pacific) rolls over, so later questions skip it. The
// admin gets at most two emails per quota day: when every primary (non-lite)
// answer model is out — answers continue on the backup tier — and when every
// model is out.

const exhaustedKey = (model: string) => `rabbi_bot_exhausted:${model}`;
const mailKey = (tier: 'primary' | 'all', day: string) => `rabbi_bot_mail:${tier}:${day}`;

/** Models already out of quota today. */
export async function loadExhausted(now = new Date()): Promise<Set<string>> {
  const rows = await prisma.appConfig.findMany({ where: { key: { in: botModels().map(exhaustedKey) } } });
  const day = quotaDay(now);
  return new Set(rows.filter(r => r.value === day).map(r => r.key.slice(exhaustedKey('').length)));
}

/** Israel clock time of the next quota reset, e.g. "10:00". */
export function resetTimeLabel(now = new Date()): string {
  return new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' })
    .format(quotaResetAt(now));
}

/** Claims an AppConfig key; false when someone already holds it. */
async function claim(key: string): Promise<boolean> {
  try {
    await prisma.appConfig.create({ data: { key, value: new Date().toISOString() } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return false;
    throw e;
  }
}

async function mail(subject: string, lines: string[]): Promise<void> {
  try {
    await sendAdminEmail(subject, lines.join('\n'), `<div dir="rtl">${lines.map(l => `<p>${l}</p>`).join('')}</div>`);
  } catch (e) {
    console.warn('[rabbi-bot] quota mail failed', e);
  }
}

export async function markExhausted(model: string, now = new Date()): Promise<void> {
  const day = quotaDay(now);
  const key = exhaustedKey(model);
  await prisma.appConfig.upsert({ where: { key }, create: { key, value: day }, update: { value: day } });

  const exhausted = await loadExhausted(now);
  const primary = answerModels().filter(m => !isBackupModel(m));
  const backup = answerModels().filter(isBackupModel);
  const allOut = botModels().every(m => exhausted.has(m));
  const primaryOut = primary.every(m => exhausted.has(m));
  const tier = allOut ? 'all' : primaryOut ? 'primary' : null;
  if (!tier || !(await claim(mailKey(tier, day)))) return;

  const since = new Date(quotaResetAt(now).getTime() - 86_400_000);
  const answered = await prisma.rabbiBotQuestion.count({ where: { createdAt: { gte: since }, cached: false } });
  const reset = resetTimeLabel(now);
  const tail = [HE.RB_MAIL_COUNT(answered), HE.RB_MAIL_RESET(reset)];
  if (tier === 'primary') await mail(HE.RB_MAIL_PRIMARY_SUBJECT, [HE.RB_MAIL_PRIMARY_BODY(backup.join(', ')), ...tail]);
  else await mail(HE.RB_MAIL_ALL_SUBJECT, [HE.RB_MAIL_ALL_BODY(reset), ...tail]);
}

/** Cleanup of old mail claims (one row per tier per day) — keeps AppConfig small. */
export async function pruneMailClaims(now = new Date()): Promise<void> {
  const keep = [quotaDay(now), quotaDay(new Date(now.getTime() - 86_400_000))];
  await prisma.appConfig.deleteMany({
    where: { key: { startsWith: 'rabbi_bot_mail:' }, NOT: keep.map(d => ({ key: { endsWith: `:${d}` } })) },
  });
}
