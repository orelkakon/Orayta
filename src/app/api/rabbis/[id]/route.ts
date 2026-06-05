import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json() as {
    name: string; fullName?: string; sortYear: number;
    datePeriod: string; isAlive: boolean; bio: string; category: string;
  };

  const rabbi = await prisma.rabbi.update({
    where: { id: params.id },
    data: {
      name: body.name,
      fullName: body.fullName ?? null,
      sortYear: body.sortYear,
      datePeriod: body.datePeriod,
      isAlive: body.isAlive,
      bio: body.bio,
      category: body.category,
    },
  });

  return NextResponse.json(rabbi);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await prisma.rabbi.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
