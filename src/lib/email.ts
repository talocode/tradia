import nodemailer, { type Transporter } from "nodemailer";

type EmailProvider = "resend" | "smtp";

function resolveProvider(): EmailProvider {
  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (configured === "resend" || configured === "smtp") return configured;
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  return "smtp";
}

function parseFromAddress(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) return "Tradia <no-reply@tradiaai.app>";
  return from.replace(/^['"]+|['"]+$/g, "");
}

function createSmtpTransporter(): Transporter {
  const host = process.env.EMAIL_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || "465");
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: parseFromAddress(),
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend API error (${response.status}): ${body || response.statusText}`);
  }
}

async function sendViaSmtp(to: string, subject: string, html: string): Promise<void> {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required for SMTP");
  }

  const transporter = createSmtpTransporter();
  await transporter.sendMail({
    from: parseFromAddress(),
    to,
    subject,
    html,
  });
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const provider = resolveProvider();

  try {
    if (provider === "resend") {
      await sendViaResend(to, subject, html);
      return;
    }
    await sendViaSmtp(to, subject, html);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email] ${provider} send failed:`, message);
    throw error;
  }
}

/** @deprecated Use sendEmail() — lazily created for legacy callers. */
export function getSmtpTransporter(): Transporter {
  return createSmtpTransporter();
}