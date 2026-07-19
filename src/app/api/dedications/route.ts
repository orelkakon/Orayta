import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendAdminEmail, formatHebrewDate } from '@/lib/mailer';
import { HE } from '@/lib/hebrewTexts';

const VALID_TYPES = ['iluy', 'refua', 'hatzlaha', 'zivug'];

const TYPE_LABELS: Record<string, string> = {
  iluy: HE.DEDICATION_TYPE_ILUY,
  refua: HE.DEDICATION_TYPE_REFUA,
  hatzlaha: HE.DEDICATION_TYPE_HATZLAHA,
  zivug: HE.DEDICATION_TYPE_ZIVUG,
};

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

/* ── Simple in-process rate limit: max 3 requests per IP per 10 minutes ── */
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

async function notifyAdmin(type: string, name: string): Promise<void> {
  const typeLabel = TYPE_LABELS[type] ?? type;
  const line = `${typeLabel} ${name}`;
  await sendAdminEmail(
    `🕯️ בקשת הקדשה חדשה — אורייתא`,
    [`בקשת הקדשה חדשה ממתינה לאישור:`, line, formatHebrewDate()].join('\n'),
    `
    <div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;max-width:560px;margin:0 auto">
      <div style="background:#5C3D1E;padding:18px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:white;margin:0;font-size:18px">🕯️ בקשת הקדשה חדשה</h2>
        <p style="color:rgba(255,255,255,0.65);margin:4px 0 0;font-size:12px">${formatHebrewDate()} · אורייתא</p>
      </div>
      <div style="border:1px solid #e5ddd4;border-top:none;padding:20px 24px;border-radius:0 0 8px 8px;background:#faf7f2">
        <p style="line-height:1.7;color:#2d1f0f;margin:0;font-size:17px"><b>${line}</b></p>
        <p style="margin:16px 0 0;font-size:13px;color:#5C3D1E">היכנס למדור ההקדשות באתר כדי לאשר או לדחות את הבקשה.</p>
      </div>
    </div>`,
  );
}

export async function GET(req: NextRequest) {
  const wantAll = req.nextUrl.searchParams.get('all') === '1' && isAdmin(req);
  const dedications = await prisma.dedication.findMany({
    where: wantAll ? undefined : { status: 'approved' },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(dedications);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { type: string; name: string };
  const type = body.type?.trim();
  const name = body.name?.trim().slice(0, 100);

  if (!type || !VALID_TYPES.includes(type) || !name) {
    return NextResponse.json({ error: 'type and name required' }, { status: 400 });
  }

  if (isAdmin(req)) {
    const dedication = await prisma.dedication.create({
      data: { type, name, status: 'approved' },
    });
    return NextResponse.json(dedication, { status: 201 });
  }

  /* Public request → saved as pending, admin notified by email */
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'יותר מדי בקשות — נסה שוב בעוד מספר דקות' },
      { status: 429 }
    );
  }

  const dedication = await prisma.dedication.create({
    data: { type, name, status: 'pending' },
  });

  notifyAdmin(type, name).catch(() => { /* swallow */ });

  return NextResponse.json(dedication, { status: 201 });
}
