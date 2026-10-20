import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { PlayQuestion, PlaySettings } from '@/types/play';
import { buildQuestions, type PlaySource } from './build';

/** Loads only the tables the chosen topics need, then freezes a question set. */
export async function questionsFor(settings: PlaySettings): Promise<PlayQuestion[]> {
  const { topics, seder, masechet } = settings;
  const where: Prisma.CitationWhereInput = masechet || seder
    ? { locations: { some: masechet ? { masechet } : { seder } } }
    : {};
  const [citations, rabbis, books, gematria] = await Promise.all([
    topics.includes('talmud')
      ? prisma.citation.findMany({
          where,
          select: { id: true, content: true, locations: { select: { masechet: true, seder: true, daf: true, amud: true } } },
        })
      : [],
    topics.includes('rabbis')
      ? prisma.rabbi.findMany({
          select: { id: true, name: true, fullName: true, bio: true, category: true, sortYear: true, datePeriod: true },
        })
      : [],
    topics.includes('rabbis') ? prisma.book.findMany({ select: { id: true, title: true, author: true } }) : [],
    topics.includes('gematria') ? prisma.gematria.findMany({ select: { id: true, word: true, value: true } }) : [],
  ]);
  const src: PlaySource = { citations, rabbis, books, gematria };
  return buildQuestions(src, topics, settings.count);
}
