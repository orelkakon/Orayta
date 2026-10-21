import { prisma } from '@/lib/db';
import { dueKinds, localClock, DEFAULT_TIME_ZONE, OMER_AFTER_SUNSET_MIN, type PushKind } from './schedule';
import { sendPush, mapLimit } from './server';
import { hebrewDayAnchor } from './hilula';
import { dailyPayload, hilulaPayload, omerPayload } from './content';
import { getOmerDay } from '@/lib/omer';
import { jerusalemSunTimes } from '@/lib/siddur/calendar';
import type { PushPayload } from '@/types/push';

const MAX_FAILURES = 20;
const LAST_FIELD = { daily: 'lastDailyDay', hilula: 'lastHilulaDay', omer: 'lastOmerDay' } as const;

export interface DispatchResult { subscribers: number; sent: number; gone: number; failed: number; skipped: number; }

/**
 * Sends every notification that is due now. Safe to run late, twice, or
 * concurrently: each send first claims its "sent today" marker with a
 * conditional update, and releases it again only on a transient failure.
 */
export async function runDispatch(): Promise<DispatchResult> {
  const now = new Date();
  const il = localClock(now, DEFAULT_TIME_ZONE);
  const sunset = localClock(jerusalemSunTimes(now).sunset, DEFAULT_TIME_ZONE).minutes;
  const omerDay = getOmerDay(now);
  const nightfall = sunset + OMER_AFTER_SUNSET_MIN;
  // After nightfall the Hebrew day of tomorrow's civil date has begun — that's whose hilula we announce.
  const tonight = hebrewDayAnchor(now);
  const hilula = tonight !== now ? await hilulaPayload(tonight, il.day) : null;
  const ctx = { hilulaTonight: hilula !== null, omerTonight: omerDay, nightfallMinutes: nightfall };

  const subs = await prisma.pushSubscription.findMany();
  const plan = subs.flatMap(sub => dueKinds(now, sub, ctx).map(kind => ({ sub, kind })));
  if (plan.length === 0) return { subscribers: subs.length, sent: 0, gone: 0, failed: 0, skipped: 0 };

  const payloads: Partial<Record<PushKind, PushPayload | null>> = { hilula };
  if (plan.some(p => p.kind === 'daily')) payloads.daily = await dailyPayload(now, il.day);
  if (omerDay !== null) payloads.omer = omerPayload(omerDay, il.day);

  const results = await mapLimit(plan, 20, async ({ sub, kind }) => {
    const payload = payloads[kind];
    if (!payload) return 'skipped';
    const day = kind === 'omer' ? il.day : localClock(now, sub.timeZone).day;
    const field = LAST_FIELD[kind];
    const claimed = await prisma.pushSubscription.updateMany({
      where: { id: sub.id, [field]: sub[field] },
      data: { [field]: day },
    });
    if (claimed.count === 0) return 'skipped';
    const outcome = await sendPush(sub, payload);
    if (outcome === 'gone') {
      await prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
    } else if (outcome === 'failed') {
      // updateMany/deleteMany: another kind for the same row may have deleted it meanwhile.
      await prisma.pushSubscription.updateMany({
        where: { id: sub.id },
        data: { [field]: sub[field], failures: { increment: 1 } },
      });
      await prisma.pushSubscription.deleteMany({ where: { id: sub.id, failures: { gte: MAX_FAILURES } } });
    } else if (sub.failures > 0) {
      await prisma.pushSubscription.updateMany({ where: { id: sub.id }, data: { failures: 0 } });
    }
    return outcome;
  });

  const count = (o: string) => results.filter(r => r === o).length;
  return { subscribers: subs.length, sent: count('sent'), gone: count('gone'), failed: count('failed'), skipped: count('skipped') };
}
