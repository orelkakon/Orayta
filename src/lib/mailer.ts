import nodemailer from 'nodemailer';

export function formatHebrewDate(): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date());
}

export function adminEmailConfigured(): boolean {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.CONTACT_EMAIL);
}

/** Sends an email to the site admin (CONTACT_EMAIL). No-op if env vars are missing. */
export async function sendAdminEmail(subject: string, text: string, html: string, replyTo?: string): Promise<void> {
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

  await transporter.sendMail({
    from: `"אורייתא" <${gmailUser}>`,
    to: toEmail,
    replyTo,
    subject,
    text,
    html,
  });
}
