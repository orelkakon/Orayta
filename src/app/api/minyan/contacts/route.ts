import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PLACE_ID_RE } from '@/lib/minyan/confidence';
import type { GabbaiContact } from '@/types/minyan';

export const dynamic = 'force-dynamic';

const PHONE_RE = /^\+?[\d\s-]{7,20}$/;

/**
 * Admin: set (or clear, when both fields are empty) the verified gabbai
 * contact for a synagogue. Only the admin can publish a phone number —
 * visitors can't, so no private number is ever posted anonymously.
 */
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as { placeId?: unknown; name?: unknown; phone?: unknown } | null;
  const placeId = typeof body?.placeId === 'string' ? body.placeId : '';
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  if (!PLACE_ID_RE.test(placeId)) return NextResponse.json({ error: 'invalid place' }, { status: 400 });
  if (phone && !PHONE_RE.test(phone)) return NextResponse.json({ error: 'invalid phone' }, { status: 400 });

  if (!name && !phone) {
    await prisma.synagogueContact.deleteMany({ where: { placeId } });
    return NextResponse.json({ gabbai: null });
  }

  const data = { gabbaiName: name || null, gabbaiPhone: phone || null };
  const row = await prisma.synagogueContact.upsert({ where: { placeId }, create: { placeId, ...data }, update: data });
  const gabbai: GabbaiContact = { name: row.gabbaiName, phone: row.gabbaiPhone, updatedAt: row.updatedAt.toISOString() };
  return NextResponse.json({ gabbai });
}
