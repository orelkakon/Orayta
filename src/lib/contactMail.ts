import { HE } from '@/lib/hebrewTexts';
import { ContactInput, escapeHtml } from '@/lib/contact';
import { formatHebrewDate } from '@/lib/mailer';

/** The contact message as the admin reads it: subject, plain text and RTL HTML. */
export function contactMail(c: ContactInput): { subject: string; text: string; html: string } {
  const who = HE.CONTACT_MAIL_FROM(c.name);
  const topic = c.topic ? HE.CONTACT_TOPICS[c.topic] : undefined;
  const date = formatHebrewDate();
  const meta: [string, string][] = [];
  if (topic) meta.push([HE.CONTACT_MAIL_TOPIC, topic]);
  if (c.replyTo) meta.push([HE.CONTACT_MAIL_REPLY, c.replyTo]);
  if (c.rating) meta.push([HE.CONTACT_MAIL_RATING, `${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)} (${c.rating}/5)`]);

  const text = [who, date, ...meta.map(([k, v]) => `${k}: ${v}`), '', c.message].join('\n');
  const rows = meta.map(([k, v]) =>
    `<tr><td style="padding:3px 0 3px 12px;color:#8a6a45;white-space:nowrap">${escapeHtml(k)}</td>`
    + `<td style="padding:3px 0;color:#2d1f0f;font-weight:600">${escapeHtml(v)}</td></tr>`).join('');

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;max-width:560px;margin:0 auto">
      <div style="background:#2A1A0C;padding:18px 24px;border-radius:10px 10px 0 0">
        <h2 style="color:#FBF4E6;margin:0;font-size:18px">📬 ${escapeHtml(who)}</h2>
        <p style="color:#E2B86B;margin:4px 0 0;font-size:12px">${escapeHtml(date)} · ${escapeHtml(HE.APP_NAME)}</p>
      </div>
      <div style="border:1px solid #e5ddd4;border-top:none;padding:20px 24px;border-radius:0 0 10px 10px;background:#faf7f2">
        ${rows ? `<table style="border-collapse:collapse;margin:0 0 14px;font-size:14px">${rows}</table>` : ''}
        <p style="white-space:pre-wrap;line-height:1.7;color:#2d1f0f;margin:0">${escapeHtml(c.message)}</p>
      </div>
    </div>`;

  return { subject: HE.CONTACT_MAIL_SUBJECT(who, topic), text, html };
}
