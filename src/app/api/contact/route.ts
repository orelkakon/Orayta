import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

/* ── Simple in-process rate limit: max 3 submissions per IP per 10 minutes ── */
const ipLog = new Map<string, number[]>();
const WINDOW_MS  = 10 * 60 * 1000; // 10 minutes
const MAX_IN_WIN = 3;

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (hits.length >= MAX_IN_WIN) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

async function sendEmail(name: string | undefined, message: string, rating: number | undefined) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const toEmail   = process.env.CONTACT_EMAIL;
  if (!gmailUser || !gmailPass || !toEmail) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const ratingText = typeof rating === 'number' ? `\nדירוג: ${'⭐'.repeat(rating)} (${rating}/5)` : '';
  const fromLabel  = name ? `מ: ${name}` : 'אנונימי';

  await transporter.sendMail({
    from: `"אורייתא" <${gmailUser}>`,
    to: toEmail,
    subject: `📬 הודעה חדשה מאורייתא — ${fromLabel}`,
    text: `${fromLabel}\n\n${message}${ratingText}`,
    html: `<div dir="rtl" style="font-family:sans-serif;font-size:15px">
      <p><strong>${fromLabel}</strong></p>
      <p style="white-space:pre-wrap">${message}</p>
      ${ratingText ? `<p>${ratingText.trim()}</p>` : ''}
    </div>`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'יותר מדי הודעות — נסה שוב בעוד מספר דקות' },
        { status: 429 }
      );
    }

    const body = await req.json() as { name?: string; message: string; rating?: number };
    const { name, message, rating } = body;

    // Validate
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'message too long' }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name: name?.trim().slice(0, 100) || null,
        message: message.trim().slice(0, 2000),
        rating: typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : null,
      },
    });

    // Send email non-blocking
    sendEmail(name?.trim(), message.trim(), typeof rating === 'number' ? rating : undefined)
      .catch(() => { /* swallow */ });

    // WhatsApp URL — phone stays server-side only
    const phone      = process.env.CONTACT_PHONE ?? '';
    const senderLabel = name?.trim() ? `מ: ${name.trim()}\n` : '';
    const ratingLabel = typeof rating === 'number' ? `\nדירוג: ${'⭐'.repeat(rating)}` : '';
    const text = encodeURIComponent(
      `${senderLabel}הודעה מאפליקציית אורייתא:\n${message.trim()}${ratingLabel}`
    );
    const waUrl = `https://wa.me/${phone}?text=${text}`;

    return NextResponse.json({ ok: true, waUrl });
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
