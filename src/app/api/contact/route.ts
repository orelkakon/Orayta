import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

/* ── Simple in-process rate limit: max 3 submissions per IP per 10 minutes ── */
const ipLog = new Map<string, number[]>();
const WINDOW_MS  = 10 * 60 * 1000;
const MAX_IN_WIN = 3;

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (hits.length >= MAX_IN_WIN) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

function formatDate(): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date());
}

async function sendEmail(name: string | undefined, message: string, rating: number | undefined) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const toEmail   = process.env.CONTACT_EMAIL;
  if (!gmailUser || !gmailPass || !toEmail) return;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
    tls: { rejectUnauthorized: false },
  });

  const senderLine = name ? `הודעה חדשה מ ${name}` : 'הודעה חדשה (אנונימי)';
  const stars      = typeof rating === 'number' ? '⭐'.repeat(rating) : null;

  await transporter.sendMail({
    from: `"אורייתא" <${gmailUser}>`,
    to: toEmail,
    subject: `📬 ${senderLine} — אורייתא`,
    text: [
      senderLine,
      formatDate(),
      '',
      message,
      stars ? `דירוג: ${stars} (${rating}/5)` : '',
    ].filter(Boolean).join('\n'),
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;max-width:560px;margin:0 auto">
        <div style="background:#5C3D1E;padding:18px 24px;border-radius:8px 8px 0 0">
          <h2 style="color:white;margin:0;font-size:18px">📬 ${senderLine}</h2>
          <p style="color:rgba(255,255,255,0.65);margin:4px 0 0;font-size:12px">${formatDate()} · אורייתא</p>
        </div>
        <div style="border:1px solid #e5ddd4;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px;background:#faf7f2">
          <p style="white-space:pre-wrap;line-height:1.7;color:#2d1f0f;margin:0">${message}</p>
          ${stars ? `<p style="margin:16px 0 0;font-size:14px;color:#5C3D1E">דירוג: ${stars} (${rating}/5)</p>` : ''}
        </div>
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

    const body = await req.json() as { name?: string; message: string; rating?: number; channel?: 'wa' | 'email' };
    const { name, message, rating, channel } = body;

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

    if (channel !== 'wa') {
      sendEmail(name?.trim(), message.trim(), typeof rating === 'number' ? rating : undefined)
        .catch(() => { /* swallow */ });
    }

    // WhatsApp — conversational, written from the user's perspective
    const phone  = process.env.CONTACT_PHONE ?? '';
    const intro  = name?.trim() ? `היי, אני ${name.trim()} 👋` : 'היי 👋';
    const stars  = typeof rating === 'number' ? `\nדירוג: ${rating}/5` : '';
    const waText = encodeURIComponent(
      `${intro}\nפניתי דרך אפליקציית אורייתא\n\n${message.trim()}${stars}`
    );
    const waUrl = `https://wa.me/${phone}?text=${waText}`;

    return NextResponse.json({ ok: true, waUrl });
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
