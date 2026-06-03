import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [total, correct, recent] = await Promise.all([
    prisma.quizResult.count(),
    prisma.quizResult.count({ where: { isCorrect: true } }),
    prisma.quizResult.findMany({
      take: 10,
      orderBy: { answeredAt: 'desc' },
      include: { citation: { select: { content: true } } },
    }),
  ]);

  const stats = {
    total,
    correct,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    recentResults: recent.map((r) => ({
      isCorrect: r.isCorrect,
      answeredAt: r.answeredAt.toISOString(),
      citationContent: r.citation.content,
    })),
  };

  return NextResponse.json(stats);
}
