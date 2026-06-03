import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [results, recent] = await Promise.all([
    prisma.quizResult.findMany({ select: { score: true } }),
    prisma.quizResult.findMany({
      take: 10,
      orderBy: { answeredAt: 'desc' },
      include: { citation: { select: { content: true } } },
    }),
  ]);

  const total = results.length;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);

  return NextResponse.json({
    total,
    totalScore,
    accuracy: total > 0 ? Math.round((totalScore / total) * 100) : 0,
    recentResults: recent.map((r) => ({
      score: r.score,
      answeredAt: r.answeredAt.toISOString(),
      citationContent: r.citation.content,
    })),
  });
}
