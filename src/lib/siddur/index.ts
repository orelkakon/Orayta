import type { PrayerService, PrayerPart, ServiceId } from './types';
import { SHACHARIT } from './shacharit';
import { MINCHA, ARVIT } from './minchaArvit';

export * from './types';

export const SERVICES: PrayerService[] = [SHACHARIT, MINCHA, ARVIT];

export const SERVICE_IDS: ServiceId[] = SERVICES.map(s => s.id);

export function isServiceId(v: unknown): v is ServiceId {
  return typeof v === 'string' && (SERVICE_IDS as string[]).includes(v);
}

export function getService(id: ServiceId): PrayerService {
  return SERVICES.find(s => s.id === id) ?? SHACHARIT;
}

/** Every distinct Sefaria node a service needs — fetched once each. */
export function serviceNodes(service: PrayerService): string[] {
  return Array.from(new Set(service.sections.flatMap(s => s.parts.map(p => p.node))));
}

/** The paragraphs of one part, cut from its node's segments. */
export function sliceSegments(nodes: Record<string, string[]>, part: PrayerPart): string[] {
  return (nodes[part.node] ?? []).slice(part.from - 1, part.to);
}

/** Stable DOM anchor for a part's sub-mark, e.g. "amida--2". */
export function markAnchor(sectionId: string, partIndex: number): string {
  return `${sectionId}--${partIndex}`;
}
