import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

async function sendEmail(name: string | undefined, message: string, rating: number | undefined) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const toEmail   = process.env.CONTACT_EMAIL;

  if (!gmailUser || !gmailPass || !toEmail) return; // email not configured — skip silently

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

    // Send email (non-blocking — don't fail the request if email fails)
    sendEmail(name?.trim(), message.trim(), typeof rating === 'number' ? rating : undefined)
      .catch(() => { /* swallow email errors */ });

    // Build WhatsApp link server-side so phone stays hidden from client
    const phone = process.env.CONTACT_PHONE ?? '';
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
