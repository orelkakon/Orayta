import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HE } from '@/lib/hebrewTexts';
import { parseContact, replyEmail, waPhone } from '@/lib/contact';
import { contactMail } from '@/lib/contactMail';
import { adminEmailConfigured, sendAdminEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

/* In-process rate limit: max 5 submissions per IP per 10 minutes. */
const ipLog = new Map<string, number[]>();
const WINDOW_MS  = 10 * 60 * 1000;
const MAX_IN_WIN = 5;

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (hits.length >= MAX_IN_WIN) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

/** The WhatsApp number, so the page can open wa.me straight from the tap (iOS blocks pop-ups after an await). */
export function GET() {
  return NextResponse.json({ wa: waPhone(process.env.CONTACT_PHONE) });
}

/**
 * Saves the message and, for the email channel, sends it to the admin before
 * answering — a send left running after the response is cut off on Vercel.
 * `channel: 'wa'` only records it; the page opens WhatsApp itself.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) return NextResponse.json({ error: 'rate' }, { status: 429 });

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    // Honeypot: a hidden field only bots fill. Answer as if it worked.
    if (body && typeof body.website === 'string' && body.website) return NextResponse.json({ ok: true });
    const input = parseContact(body);
    if (!input) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const channel = body?.channel === 'wa' ? 'wa' : 'email';

    const header = [
      input.topic ? `${HE.CONTACT_MAIL_TOPIC}: ${HE.CONTACT_TOPICS[input.topic]}` : '',
      input.replyTo ? `${HE.CONTACT_MAIL_REPLY}: ${input.replyTo}` : '',
    ].filter(Boolean);
    await prisma.contactMessage.create({
      data: {
        name: input.name ?? null,
        message: header.length ? `${header.join('\n')}\n\n${input.message}` : input.message,
        rating: input.rating ?? null,
      },
    });

    if (channel === 'wa') return NextResponse.json({ ok: true });

    if (!adminEmailConfigured()) {
      console.error('[contact] email not configured (GMAIL_USER / GMAIL_APP_PASSWORD / CONTACT_EMAIL)');
      return NextResponse.json({ error: 'mail' }, { status: 502 });
    }
    const mail = contactMail(input);
    try {
      await sendAdminEmail(mail.subject, mail.text, mail.html, replyEmail(input.replyTo));
    } catch (e) {
      console.error('[contact] email failed:', e instanceof Error ? e.message : e);
      return NextResponse.json({ error: 'mail' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[contact] failed:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
