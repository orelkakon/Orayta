import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { signValue, verifySignedValue } from '@/lib/auth';
import type { RabbiBotAnswer } from '@/types/rabbiBot';
import { citedBooks } from './verify';
import { RETENTION_DAYS } from './rules';

// Server-only persistence for רבי־בוט: rate limits, answer cache, the stats
// row per question, and the 10-day purge of everything personal.

const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_MAX = 4;
const DAY_MAX = 25;
const DAY_MS = 86_400_000;
const RETENTION_MS = RETENTION_DAYS * DAY_MS;

export function botIpHash(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return createHash('sha256').update(`${ip}|orayta_rabbi_bot_v1`).digest('hex');
}

export async function isRateLimited(ipHash: string): Promise<boolean> {
  const now = Date.now();
  const [burst, day] = await Promise.all([
    prisma.rabbiBotQuestion.count({ where: { ipHash, createdAt: { gte: new Date(now - BURST_WINDOW_MS) } } }),
    prisma.rabbiBotQuestion.count({ where: { ipHash, createdAt: { gte: new Date(now - DAY_MS) } } }),
  ]);
  return burst >= BURST_MAX || day >= DAY_MAX;
}

/** A recent, unreported, not-badly-rated answer to the same question. */
export async function findCached(qHash: string): Promise<RabbiBotAnswer | null> {
  const row = await prisma.rabbiBotQuestion.findFirst({
    where: {
      qHash, status: 'answered', reported: false,
      createdAt: { gte: new Date(Date.now() - RETENTION_MS) },
      OR: [{ rating: null }, { rating: { gte: 3 } }],
    },
    orderBy: { createdAt: 'desc' },
    select: { answer: true },
  });
  return row?.answer ? row.answer as unknown as RabbiBotAnswer : null;
}

export interface SaveInput {
  question: string;
  qHash: string;
  ipHash: string;
  answer: RabbiBotAnswer;
  model: string | null;
  cached: boolean;
  latencyMs: number;
}

export async function saveQuestion(s: SaveInput): Promise<string> {
  const row = await prisma.rabbiBotQuestion.create({
    data: {
      question: s.question, qHash: s.qHash, ipHash: s.ipHash,
      answer: s.answer as unknown as Prisma.InputJsonValue,
      status: s.answer.status, topic: s.answer.topic, model: s.model, cached: s.cached,
      points: s.answer.total, verified: s.answer.verified, books: citedBooks(s.answer),
      latencyMs: s.latencyMs,
    },
    select: { id: true },
  });
  return row.id;
}

/** Erase question/answer text and IP hashes older than the retention window. */
export async function purgeOld(): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_MS);
  await prisma.rabbiBotQuestion.updateMany({
    where: { createdAt: { lt: cutoff }, OR: [{ question: { not: null } }, { ipHash: { not: null } }, { note: { not: null } }] },
    data: { question: null, answer: Prisma.DbNull, qHash: null, ipHash: null, note: null },
  });
}

const tokenValue = (id: string) => `rabbi-bot:${id}`;
export const signQuestionToken = (id: string) => signValue(tokenValue(id)) ?? '';
export const verifyQuestionToken = (id: string, token: string | null) => verifySignedValue(tokenValue(id), token);

export async function applyFeedback(id: string, data: { rating?: number; report?: boolean; note?: string }): Promise<boolean> {
  const r = await prisma.rabbiBotQuestion.updateMany({
    where: { id },
    data: {
      ...(data.rating ? { rating: data.rating } : {}),
      ...(data.report ? { reported: true, note: data.note || null } : {}),
    },
  });
  return r.count === 1;
}
