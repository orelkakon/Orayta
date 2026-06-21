import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function GET() {
  const dedications = await prisma.dedication.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(dedications);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { type: string; name: string };
  const { type, name } = body;

  if (!type || !name?.trim()) {
    return NextResponse.json({ error: 'type and name required' }, { status: 400 });
  }

  const dedication = await prisma.dedication.create({
    data: { type: type.trim(), name: name.trim() },
  });
  return NextResponse.json(dedication, { status: 201 });
}
