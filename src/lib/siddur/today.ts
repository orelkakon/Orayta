import type { PrayerService } from './types';
import type { PrayerDay } from './occasions';
import { conditionApplies, EVERYDAY } from './calendar';
import { markAnchor } from './index';
import { HE } from '@/lib/hebrewTexts';

export interface SpecialItem { label: string; anchor: string; }

/**
 * What makes this service different today: every conditional section or
 * part (beyond ordinary-day variants) that applies, in prayer order.
 */
export function todaySpecials(service: PrayerService, day: PrayerDay): SpecialItem[] {
  const items: SpecialItem[] = [];
  const seen = new Set<string>();
  const add = (label: string, anchor: string) => {
    if (seen.has(label)) return;
    seen.add(label);
    items.push({ label, anchor });
  };
  for (const s of service.sections) {
    if (s.when && !conditionApplies(s.when, day)) continue;
    if (s.when && !EVERYDAY.has(s.when)) { add(s.title, s.id); continue; }
    s.parts.forEach((p, i) => {
      if (p.when && p.mark && !EVERYDAY.has(p.when) && p.when !== 'optional' && conditionApplies(p.when, day)) {
        add(p.mark, markAnchor(s.id, i));
      }
    });
  }
  return items;
}

/** Human labels for today's occasions ("ראש חודש", "חנוכה · יום ג׳"…). */
export function occasionLabels(day: PrayerDay): string[] {
  const labels: string[] = [];
  if (day.chanukahDay) labels.push(HE.SIDDUR_CHANUKAH_DAY(day.chanukahDay));
  day.occasions.forEach(o => { const l = HE.SIDDUR_OCCASIONS[o]; if (l) labels.push(l); });
  if (day.omerDay) labels.push(HE.OMER_DAY_TAG(day.omerDay));
  return labels;
}
