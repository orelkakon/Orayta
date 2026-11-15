import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, verifyPasscode } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseEntryInput } from '@/lib/sikum/entryInput';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const input = parseEntryInput(await req.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'text required' }, { status: 400 });
  const entry = await prisma.sikumEntry.update({ where: { id: params.id }, data: input });
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!verifyPasscode(req.headers.get('x-admin-pass'))) {
    return NextResponse.json({ error: 'invalid passcode' }, { status: 401 });
  }
  await prisma.sikumEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
