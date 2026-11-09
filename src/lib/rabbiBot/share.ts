import type { RabbiBotAnswer } from '@/types/rabbiBot';
import { HE } from '@/lib/hebrewTexts';
import { SITE_URL, RLM, clip } from '@/lib/siteUrl';

const MAX_POINTS = 4;

/**
 * A WhatsApp-ready text for an answered question: the question, the short
 * answer, the main points with where each comes from, the sources, and a link
 * to /ask. Every line starts with RLM so Hebrew lines that open with a bullet or
 * a parenthesis keep right-to-left order. Pure — unit-tested.
 */
export function answerShareText(question: string, a: RabbiBotAnswer): string {
  const refs = (cites: { source: number }[]) =>
    Array.from(new Set(cites.map(c => a.sources[c.source]?.heRef).filter(Boolean))).join(', ');
  const points = a.points.slice(0, MAX_POINTS).map(p => `• ${clip(p.text, 220)}${p.cites.length ? ` (${refs(p.cites)})` : ''}`);
  const lines = [
    HE.RB_SHARE_Q(clip(question, 200)),
    '',
    ...(a.short ? [a.short] : []),
    ...(a.byRule ? [HE.RB_SHARE_RULE] : []),
    ...(points.length ? ['', ...points] : []),
    ...(a.sources.length ? ['', `${HE.RB_SHARE_SOURCES} ${a.sources.map(s => s.heRef).join(' · ')}`] : []),
    '',
    HE.RB_SHARE_SIG,
    // The question's own link: previews as the question and asks it on arrival.
    `${SITE_URL}/ask?q=${encodeURIComponent(question.trim())}`,
  ];
  return lines.map(l => (l ? `${RLM}${l}` : l)).join('\n');
}
