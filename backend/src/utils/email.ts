import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { logger } from './logger';

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.warn('SMTP not configured – emails will be logged only');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    // Port 465 uses implicit TLS (SSL), while other ports (e.g. 587) use
    // STARTTLS — an upgrade from plain to encrypted mid-connection.
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM_NAME = '3R Elite Marketplace';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || 'support@3relite.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://3relite.com';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function send(to: string, subject: string, html: string): Promise<void> {
  if (resend) {
    try {
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to} via Resend: ${subject}`);
      return;
    } catch (err) {
      logger.error(`Resend delivery failed for ${to}: ${String(err)}`);
    }
  }

  const transport = createTransport();
  if (!transport) {
    logger.info(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${String(err)}`);
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const subject = 'Welcome to 3R Elite Marketplace! 🎉';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;font-family:Inter,Helvetica Neue,Arial,sans-serif;background:#f0f9ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(2,132,199,0.10);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0284c7 0%,#0369a1 50%,#1d4ed8 100%);padding:40px 40px 32px;">
          <table width="100%"><tr>
            <td>
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:40px;height:40px;background:rgba(197,160,89,0.2);border:2px solid rgba(197,160,89,0.4);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#C5A059;font-size:16px;line-height:40px;text-align:center;">3R</div>
                <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">3R <em style="font-style:italic;">Elite</em></span>
              </div>
              <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">The Premier Online Marketplace</p>
            </td>
          </tr></table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="font-size:28px;font-weight:800;color:#0284c7;margin:0 0 12px;">Welcome, ${name}! 🎉</h1>
          <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 24px;">
            Your account has been successfully created on 3R Elite Marketplace — the premier platform connecting buyers and sellers across UAE and Uganda.
          </p>
          <div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:16px;padding:24px;margin-bottom:28px;">
            <p style="font-size:14px;font-weight:700;color:#0284c7;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">What you can do now:</p>
            <ul style="margin:0;padding:0 0 0 20px;color:#374151;font-size:14px;line-height:2;">
              <li>Browse thousands of listings across UAE &amp; Uganda</li>
              <li>Post your first listing — it's free!</li>
              <li>Set up your seller store</li>
              <li>Save your favourite items</li>
            </ul>
          </div>
          <a href="${FRONTEND_URL}" style="display:inline-block;background:linear-gradient(135deg,#0284c7,#0369a1);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;margin-bottom:28px;">Start Exploring →</a>
          <hr style="border:none;border-top:1px solid #e0f2fe;margin:0 0 24px;" />
          <p style="font-size:13px;color:#6b7280;margin:0;">
            Need help? Contact us at <a href="mailto:support@3relite.com" style="color:#0284c7;text-decoration:none;font-weight:600;">support@3relite.com</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e0f2fe;">
          <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">&copy; ${new Date().getFullYear()} 3R Elite Marketplace. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  await send(to, subject, html);
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<void> {
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;
  const subject = 'Reset your 3R Elite password';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;font-family:Inter,Helvetica Neue,Arial,sans-serif;background:#f0f9ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(2,132,199,0.10);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0284c7 0%,#0369a1 50%,#1d4ed8 100%);padding:40px 40px 32px;">
          <table width="100%"><tr>
            <td>
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:40px;height:40px;background:rgba(197,160,89,0.2);border:2px solid rgba(197,160,89,0.4);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#C5A059;font-size:16px;line-height:40px;text-align:center;">3R</div>
                <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">3R <em style="font-style:italic;">Elite</em></span>
              </div>
              <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">The Premier Online Marketplace</p>
            </td>
          </tr></table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="font-size:26px;font-weight:800;color:#0284c7;margin:0 0 12px;">Password Reset Request</h1>
          <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 24px;">
            Hi ${name}, we received a request to reset the password for your 3R Elite account.
          </p>
          <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
            Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#0284c7,#0369a1);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;margin-bottom:28px;">Reset My Password →</a>
          <div style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="font-size:13px;color:#92400e;margin:0;line-height:1.6;">
              ⚠️ If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>
          </div>
          <p style="font-size:13px;color:#6b7280;margin:0;word-break:break-all;">
            Or copy this link: <a href="${resetUrl}" style="color:#0284c7;">${resetUrl}</a>
          </p>
          <hr style="border:none;border-top:1px solid #e0f2fe;margin:24px 0;" />
          <p style="font-size:13px;color:#6b7280;margin:0;">
            Need help? Contact us at <a href="mailto:support@3relite.com" style="color:#0284c7;text-decoration:none;font-weight:600;">support@3relite.com</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e0f2fe;">
          <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">&copy; ${new Date().getFullYear()} 3R Elite Marketplace. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  await send(to, subject, html);
}
