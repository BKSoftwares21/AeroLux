import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || 'no-reply@aerolux.local';
const fromName = process.env.FROM_NAME || 'AeroLux';

let transporter: nodemailer.Transporter | null = null;

if (host && port && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  });
}

export async function sendEmail(opts: { to: string; subject: string; text?: string; html?: string }) {
  // If SMTP not configured, log to console for dev and resolve
  if (!transporter) {
    console.log('[email:dev]', { to: opts.to, subject: opts.subject, text: opts.text, html: opts.html });
    return;
  }

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}