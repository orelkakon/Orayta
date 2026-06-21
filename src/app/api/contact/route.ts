import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; message: string; rating?: number };
    const { name, message, rating } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name: name?.trim() || null,
        message: message.trim(),
        rating: typeof rating === 'number' ? rating : null,
      },
    });

    // Build WhatsApp link server-side so phone stays hidden from client
    const phone = process.env.CONTACT_PHONE ?? '';
    const senderLabel = name?.trim() ? `מ: ${name.trim()}\n` : '';
    const ratingLabel = typeof rating === 'number' ? `\nדירוג: ${'⭐'.repeat(rating)}` : '';
    const text = encodeURIComponent(`${senderLabel}הודעה מאפליקציית אורייתא:\n${message.trim()}${ratingLabel}`);
    const waUrl = `https://wa.me/${phone}?text=${text}`;

    return NextResponse.json({ ok: true, waUrl });
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
